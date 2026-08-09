// src/lib/socket.ts
// Admin panel Socket.io client — real-time booking + advocate notifications

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || '/api/v1')
  .replace('/api/v1', '');

let socket: Socket | null = null;

/**
 * Connect admin socket using stored JWT token.
 * Admin auto-joins 'admin_room' on the backend upon connection.
 */
export const connectAdminSocket = (): Socket | null => {
  if (socket?.connected) return socket;

  const token = localStorage.getItem('adminToken');
  if (!token) {
    console.log('[AdminSocket] No token — not connecting');
    return null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 10000,
  });

  socket.on('connect', () =>
    console.log('[AdminSocket] ✅ Connected — admin_room joined automatically by server')
  );
  socket.on('connect_error', (err) =>
    console.warn('[AdminSocket] ❌ Error:', err.message)
  );
  socket.on('disconnect', (reason) =>
    console.log('[AdminSocket] Disconnected:', reason)
  );

  return socket;
};

export const getAdminSocket = (): Socket | null => {
  if (socket?.connected) return socket;
  return connectAdminSocket();
};

export const disconnectAdminSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[AdminSocket] Disconnected');
  }
};
