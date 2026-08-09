import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace('/api/v1', '') ||
  'https://legalitt-growth.onrender.com';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socket;
};

export const connectSocket = (token: string): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.auth = { token };
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

// ─── Admin-specific event listeners ─────────────────────────────────────────
export const subscribeToAdminEvents = (handlers: {
  onNewBooking?: (data: any) => void;
  onAdvocateJoined?: (data: any) => void;
  onPaymentReceived?: (data: any) => void;
  onSupportTicket?: (data: any) => void;
}) => {
  const s = getSocket();

  if (handlers.onNewBooking) s.on('admin:new_booking', handlers.onNewBooking);
  if (handlers.onAdvocateJoined) s.on('admin:advocate_registered', handlers.onAdvocateJoined);
  if (handlers.onPaymentReceived) s.on('admin:payment_received', handlers.onPaymentReceived);
  if (handlers.onSupportTicket) s.on('admin:support_ticket', handlers.onSupportTicket);

  return () => {
    s.off('admin:new_booking');
    s.off('admin:advocate_registered');
    s.off('admin:payment_received');
    s.off('admin:support_ticket');
  };
};

export default getSocket;
