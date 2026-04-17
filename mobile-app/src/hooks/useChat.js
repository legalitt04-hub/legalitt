import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { chatAPI } from '../services/api';
import { TOKEN_KEY } from '../services/api';

const SOCKET_URL = process.env.SOCKET_URL || 'https://legalitt-api.onrender.com';

/**
 * Full-featured chat hook: socket connection, messages, typing, read receipts.
 */
export const useChat = (chatId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Load message history
  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      const { data } = await chatAPI.getMessages(chatId, { page: 1, limit: 50 });
      setMessages(data.data || []);
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  // Socket connection lifecycle
  useEffect(() => {
    if (!chatId) return;
    let socket;

    const connect = async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) return;

      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        setConnected(true);
        setError(null);
        socket.emit('join_chat', { chatId });
        socket.emit('mark_read', { chatId });
      });

      socket.on('disconnect', () => setConnected(false));
      socket.on('connect_error', () => setError('Connection failed'));

      socket.on('new_message', (msg) => {
        setMessages(prev => {
          // Deduplicate
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Mark as read when received
        socket.emit('mark_read', { chatId });
      });

      socket.on('user_typing', () => {
        setIsTyping(true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsTyping(false), 2500);
      });

      socket.on('user_stopped_typing', () => setIsTyping(false));

      socketRef.current = socket;
    };

    loadMessages();
    connect();

    return () => {
      clearTimeout(typingTimerRef.current);
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [chatId, loadMessages]);

  const sendMessage = useCallback((content, messageType = 'text', fileUrl, fileName) => {
    if (!socketRef.current?.connected) return false;
    socketRef.current.emit('send_message', { chatId, content, messageType, fileUrl, fileName });
    return true;
  }, [chatId]);

  const sendTyping = useCallback(() => {
    socketRef.current?.emit('typing', { chatId });
  }, [chatId]);

  const sendStopTyping = useCallback(() => {
    socketRef.current?.emit('stop_typing', { chatId });
  }, [chatId]);

  return {
    messages, loading, connected, isTyping, error,
    sendMessage, sendTyping, sendStopTyping,
  };
};

/**
 * Hook for the chat list screen.
 */
export const useChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await chatAPI.getMyChats();
      setChats(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { chats, loading, error, refetch: fetch };
};
