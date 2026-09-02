// src/services/socket.js
// Singleton Socket.io client for real-time updates
// Used by MyBookingsScreen, ChatScreen, AdvocateDashboard, AuthContext

import { io } from 'socket.io-client';
import * as SecureStore from '../utils/secureStorage';
import { BASE_URL } from './api';

// Strip /api/v1 to get base server URL
const SOCKET_URL = BASE_URL.replace('/api/v1', '');

// MUST match TOKEN_KEY in api.js
const TOKEN_KEY = 'authToken';

let socket = null;

/**
 * Connect to Socket.io server with JWT token.
 * @param {string} [tokenOverride] — Pass token directly after login to avoid async delay
 */
export const connectSocket = async (tokenOverride) => {
  if (socket && socket.connected) return socket;

  try {
    const token = tokenOverride || await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) {
      console.log('[Socket] No auth token — not connecting');
      return null;
    }

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on('connect', () => console.log('[Socket] ✅ Connected:', socket.id));
    socket.on('connect_error', (err) => console.log('[Socket] ❌ Error:', err.message));
    socket.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));

    return socket;
  } catch (err) {
    console.log('[Socket] Failed:', err.message);
    return null;
  }
};

/**
 * Get current socket (auto-reconnects if needed)
 */
export const getSocket = () => {
  if (socket && socket.connected) return socket;
  connectSocket();
  return socket;
};

/**
 * Disconnect and clear socket (call on logout)
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket] Disconnected');
  }
};

export default { connectSocket, getSocket, disconnectSocket };
