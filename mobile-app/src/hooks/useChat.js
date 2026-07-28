import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { chatAPI, BASE_URL } from '../services/api';
import { TOKEN_KEY } from '../services/api';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';

// Derive SOCKET_URL dynamically from BASE_URL (which properly resolves hostIp for simulators/devices)
const SOCKET_URL = BASE_URL.replace('/api', '');
const PAGE_SIZE = 30;

/**
 * Full-featured chat hook:
 * - Socket.io real-time messaging
 * - Message history with pagination (load older messages)
 * - Offline message queue (sends queued messages on reconnect)
 * - Typing indicators
 * - Read receipts (sent + delivered)
 * - Read receipt incoming updates (marks double-tick blue)
 */
export const useChat = (chatId, userId) => {
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(true);
  const [connected, setConnected]     = useState(false);
  const [isTyping, setIsTyping]       = useState(false);
  const [error, setError]             = useState(null);
  const pageRef                       = useRef(1);
  const socketRef                     = useRef(null);
  const typingTimerRef                = useRef(null);
  const offlineQueueRef               = useRef([]); // Queue for offline messages

  // ── Load initial message history ──────────────────────────────
  const loadMessages = useCallback(async (page = 1) => {
    if (!chatId) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await chatAPI.getMessages(chatId, { page, limit: PAGE_SIZE });
      const incoming = data.data || []; // Backend already reversed it to oldest-first chronological order
      if (page === 1) {
        setMessages(incoming);
      } else {
        // Prepend older messages
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m._id));
          const newOnes = incoming.filter(m => !existingIds.has(m._id));
          return [...newOnes, ...prev];
        });
      }
      // If we got fewer than PAGE_SIZE, there are no more older messages
      setHasMore(incoming.length === PAGE_SIZE);
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [chatId]);

  // ── Load older (paginated) messages ───────────────────────────
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    pageRef.current += 1;
    await loadMessages(pageRef.current);
  }, [loadingMore, hasMore, loadMessages]);

  // ── Flush offline queue when reconnected ──────────────────────
  const flushOfflineQueue = useCallback(() => {
    if (!socketRef.current?.connected) return;
    const queue = [...offlineQueueRef.current];
    offlineQueueRef.current = [];
    queue.forEach(msg => {
      socketRef.current.emit('send_message', msg);
    });
  }, []);

  // ── Socket lifecycle ──────────────────────────────────────────
  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }
    let socket;

    const connect = async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) return;

      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
      });

      socket.on('connect', () => {
        setConnected(true);
        setError(null);
        socket.emit('join_chat', { chatId });
        socket.emit('mark_read', { chatId });
        flushOfflineQueue(); // Send any queued offline messages
      });

      socket.on('disconnect', () => setConnected(false));

      socket.on('connect_error', () => {
        setConnected(false);
        setError('Connecting...');
      });

      // ── Incoming message ────────────────────────────────────
      socket.on('new_message', (msg) => {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Auto mark as read when actively in chat
        socket.emit('mark_read', { chatId });
      });

      // ── Read receipts inbound — update existing messages ────
      socket.on('messages_read', ({ chatId: cid, readAt }) => {
        if (cid !== chatId) return;
        setMessages(prev =>
          prev.map(m =>
            m.readAt ? m : { ...m, readAt }
          )
        );
      });

      // ── Typing ──────────────────────────────────────────────
      socket.on('user_typing', () => {
        setIsTyping(true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsTyping(false), 2500);
      });
      socket.on('user_stopped_typing', () => setIsTyping(false));

      socketRef.current = socket;
    };

    pageRef.current = 1;
    loadMessages(1);
    connect();

    return () => {
      clearTimeout(typingTimerRef.current);
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [chatId, loadMessages, flushOfflineQueue]);

  // ── Send a message (with offline queue fallback) ──────────────
  const sendMessage = useCallback((content, messageType = 'text', fileUrl, fileName) => {
    const payload = { chatId, content, messageType, fileUrl, fileName };

    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', payload);
      return true;
    } else {
      // Queue for offline sending — add optimistic message to UI
      offlineQueueRef.current.push(payload);
      const optimistic = {
        _id: `offline-${Date.now()}`,
        chat: chatId,
        sender: userId,
        content,
        messageType,
        fileUrl,
        fileName,
        createdAt: new Date().toISOString(),
        pending: true, // Show a pending indicator
      };
      setMessages(prev => [...prev, optimistic]);
      return false;
    }
  }, [chatId, userId]);

  const sendTyping = useCallback(() => {
    socketRef.current?.emit('typing', { chatId });
  }, [chatId]);

  const sendStopTyping = useCallback(() => {
    socketRef.current?.emit('stop_typing', { chatId });
  }, [chatId]);

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    connected,
    isTyping,
    error,
    sendMessage,
    sendTyping,
    sendStopTyping,
    loadMoreMessages,
  };
};

/**
 * Hook for the chat list screen.
 * Listens to 'conversation_updated' socket events to update the list in real-time.
 */
export const useChatList = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [chats, setChats]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const socketRef             = useRef(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchChats();
    });
    return unsubscribe;
  }, [navigation, fetchChats]);

  const fetchChats = useCallback(async () => {
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

  useEffect(() => {
    fetchChats();

    // Connect socket just for list-level events
    const connectListSocket = async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token || !SOCKET_URL) return;

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {});

      // Real-time conversation list update
      socket.on('conversation_updated', ({ chatId, lastMessage, updatedAt }) => {
        setChats(prev => {
          const exists = prev.some(c => c._id === chatId);
          if (!exists) {
            fetchChats();
            return prev;
          }
          
          const myId = user?._id?.toString() || user?.id?.toString();
          const isMyMsg = lastMessage?.senderId && myId && lastMessage.senderId.toString() === myId;
          
          return prev.map(c => {
            if (c._id !== chatId) return c;
            return {
              ...c,
              lastMessage: { content: lastMessage.content },
              updatedAt,
              unreadCount: isMyMsg ? (c.unreadCount || 0) : (c.unreadCount || 0) + 1,
            };
          });
        });
      });

      socketRef.current = socket;
    };

    connectListSocket();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [fetchChats]);

  return { chats, loading, error, refetch: fetchChats };
};
