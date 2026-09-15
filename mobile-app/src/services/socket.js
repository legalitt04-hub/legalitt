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
let connectionPromise = null; // Lock for concurrent connection attempts

/**
 * Connect to Socket.io server with JWT token.
 * Returns a Promise that resolves when actually connected (or rejects on error).
 */
export const connectSocket = (tokenOverride) => {
  // Already live — reuse
  if (socket && socket.connected) {
    return Promise.resolve(socket);
  }

  // If a connection is already in progress, return the same promise
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise(async (resolve) => {
    try {
      const token = tokenOverride || await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        console.log('[Socket] No auth token — not connecting');
        connectionPromise = null;
        return resolve(null);
      }

      // Disconnect stale socket before creating new one
      if (socket) { socket.disconnect(); socket = null; }

      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'], // websocket FIRST for low latency
        reconnectionAttempts: 10,
        reconnectionDelay: 1500,
        timeout: 15000,
      });

      socket.once('connect', () => {
        console.log('[Socket] ✅ Connected:', socket.id);
        connectionPromise = null;
        resolve(socket);
      });

      socket.once('connect_error', (err) => {
        console.log('[Socket] ❌ Error:', err.message);
        connectionPromise = null;
        resolve(null); // Don't throw — caller handles null
      });

      socket.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));

    } catch (err) {
      console.log('[Socket] Failed:', err.message);
      connectionPromise = null;
      resolve(null);
    }
  });

  return connectionPromise;
};

/**
 * Get current socket synchronously (already connected).
 * Returns null if not yet connected — use connectSocket() to ensure connection.
 */
export const getSocket = () => {
  if (socket && socket.connected) return socket;
  return null;
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
