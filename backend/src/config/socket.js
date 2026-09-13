const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const Message = require("../models/Message");
const { Chat } = require("../models/Chat");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Advocate = require("../models/Advocate");
const { sendPushNotification } = require("../utils/pushNotification");

let io;

const initSocket = async (server) => {
  // Redis adapter enables horizontal scaling (multiple API instances share events)
  let adapterOpts = {};
  try {
    if (process.env.REDIS_URL) {
      const { createAdapter } = require("@socket.io/redis-adapter");
      const { createClient } = require("redis");
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();
      await Promise.all([pubClient.connect(), subClient.connect()]);
      adapterOpts = { adapter: createAdapter(pubClient, subClient) };
      logger.info("Socket.io Redis adapter ready");
    }
  } catch (err) {
    logger.warn("Socket.io single-instance mode:", err.message);
  }

  io = new Server(server, {
    cors: {
      origin: (origin, cb) => {
        const allowedOrigins = [
          process.env.FRONTEND_URL,
          "http://localhost:3000",
          "http://localhost:8081",
          "exp://localhost:8081",
          "http://10.0.2.2:5001"
        ].filter(Boolean);
        if (
          !origin || 
          allowedOrigins.includes(origin) || 
          origin.endsWith('.vercel.app') ||
          (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_ORIGINS === 'true')
        ) {
          return cb(null, true);
        }
        cb(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
    ...adapterOpts,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // Track online users: userId -> Set of socketIds
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.userId} (${socket.userRole})`);
    // Every user joins their personal room
    socket.join(`user:${socket.userId}`);
    // Admin users also join admin_room for global notifications
    if (socket.userRole === 'admin') {
      socket.join('admin_room');
      logger.info(`Admin ${socket.userId} joined admin_room`);
    }

    // Track online presence
    if (!onlineUsers.has(socket.userId)) onlineUsers.set(socket.userId, new Set());
    onlineUsers.get(socket.userId).add(socket.id);
    io.emit("user_online", { userId: socket.userId });

    // ── JOIN CHAT ─────────────────────────────────────────────
    socket.on("join_chat", async ({ chatId }) => {
      try {
        const chat = await Chat.findById(chatId).lean();
        if (!chat) return;
        const ok = chat.participants.some(p => p.toString() === socket.userId);
        if (!ok) return;
        socket.join(`chat:${chatId}`);
        socket.emit("joined_chat", { chatId });
      } catch (err) { logger.error("join_chat:", err.message); }
    });

    // ── SEND MESSAGE ──────────────────────────────────────────
    socket.on("send_message", async ({ chatId, content, messageType = "text", fileUrl, fileName }) => {
      try {
        const chat = await Chat.findById(chatId).lean();
        if (!chat) return socket.emit("error", { message: "Chat not found" });
        const ok = chat.participants.some(p => p.toString() === socket.userId);
        if (!ok) return socket.emit("error", { message: "Not authorized" });

        // Persist message to DB
        const message = await Message.create({
          chat: chatId,
          sender: socket.userId,
          content: content?.substring(0, 5000),
          messageType,
          fileUrl,
          fileName,
        });

        // Update chat's lastMessage + updatedAt for conversation list refresh
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          updatedAt: new Date()
        });

        const populated = await message.populate("sender", "name avatar");
        
        // Emit to everyone in the chat room
        io.to(`chat:${chatId}`).emit("new_message", populated);

        // Emit conversation_updated so ChatListScreen refreshes in real-time
        chat.participants.forEach(pid => {
          io.to(`user:${pid}`).emit("conversation_updated", {
            chatId,
            lastMessage: {
              content: messageType === 'text' ? content : `📎 ${fileName || 'Attachment'}`,
              sender: populated.sender?.name,
              senderId: socket.userId,
            },
            updatedAt: new Date(),
          });
        });

        // ── PUSH NOTIFICATIONS for offline users ──────────────
        const senderUser = await User.findById(socket.userId).select('name').lean();
        const senderName = senderUser?.name || 'New message';
        const notifBody = messageType === 'text'
          ? content?.substring(0, 100)
          : `📎 ${fileName || 'Sent an attachment'}`;

        // Send push only to participants NOT in the chat room right now
        for (const pid of chat.participants) {
          if (pid.toString() === socket.userId) continue;

          const isOnline = onlineUsers.has(pid.toString()) && onlineUsers.get(pid.toString()).size > 0;
          
          // Always emit in-app notification
          io.to(`user:${pid}`).emit("message_notification", {
            chatId,
            message: {
              content: notifBody,
              senderName,
            }
          });

          // Push notification only if user is offline
          if (!isOnline) {
            const recipient = await User.findById(pid).select('expoPushToken').lean();
            if (recipient?.expoPushToken) {
              await sendPushNotification(
                recipient.expoPushToken,
                `💬 ${senderName}`,
                notifBody,
                { chatId, type: 'new_message' }
              );
            }
          }
        }

      } catch (err) {
        logger.error("send_message:", err.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── TYPING INDICATORS ─────────────────────────────────────
    socket.on("typing", ({ chatId }) =>
      socket.to(`chat:${chatId}`).emit("user_typing", { userId: socket.userId }));
    socket.on("stop_typing", ({ chatId }) =>
      socket.to(`chat:${chatId}`).emit("user_stopped_typing", { userId: socket.userId }));

    // ── READ RECEIPTS ─────────────────────────────────────────
    socket.on("mark_read", async ({ chatId }) => {
      try {
        const result = await Message.updateMany(
          { chat: chatId, sender: { $ne: socket.userId }, readAt: null },
          { readAt: new Date() }
        );
        if (result.modifiedCount > 0) {
          socket.to(`chat:${chatId}`).emit("messages_read", {
            chatId,
            userId: socket.userId,
            readAt: new Date()
          });
        }
      } catch (err) { logger.error("mark_read:", err.message); }
    });

    // ── CALL SIGNALING ─────────────────────────────────────────────────
    // Either client or advocate emits this when they tap "Video Call" / "Voice Call"
    socket.on("initiate_call", async ({ bookingId, chatId, zegoRoomId, mode }) => {
      try {
        let targetUserId;
        let callerUser;
        let bookingDetails = {};

        if (bookingId) {
          const booking = await Booking.findById(bookingId)
            .select('advocate client videoRoomId advocateVideoToken zegoAppId')
            .lean();
          if (!booking) return;

          const advocate = await Advocate.findById(booking.advocate).lean();
          if (!advocate?.user) return;
          const advocateUserId = advocate.user.toString();

          const isClientCalling = booking.client.toString() === socket.userId;
          const isAdvocateCalling = advocateUserId === socket.userId;

          if (!isClientCalling && !isAdvocateCalling) return; // unauthorized
          targetUserId = isClientCalling ? advocateUserId : booking.client.toString();
          
          bookingDetails = {
            zegoRoomId: booking.videoRoomId,
            advocateToken: booking.advocateVideoToken,
            zegoAppId: booking.zegoAppId,
            clientId: booking.client.toString(),
            advocateUserId: advocateUserId,
            isClientCalling,
          };
        } else if (chatId) {
          // Fallback to chat participants if no booking ID
          const chat = await Chat.findById(chatId).lean();
          if (!chat) return;
          if (!chat.participants.some(p => p.toString() === socket.userId)) return;
          targetUserId = chat.participants.find(p => p.toString() !== socket.userId)?.toString();
          if (!targetUserId) return;
        } else {
          return;
        }

        callerUser = await User.findById(socket.userId).select('name avatar role').lean();
        const targetUser = await User.findById(targetUserId).select('expoPushToken role').lean();

        // Determine client and advocate IDs based on roles if not already known
        let resolvedClientId = bookingDetails.clientId;
        let resolvedAdvocateId = bookingDetails.advocateUserId; // we need this if we have it
        
        if (!resolvedClientId) {
          if (callerUser?.role === 'client') resolvedClientId = socket.userId;
          else if (targetUser?.role === 'client') resolvedClientId = targetUserId;
          else resolvedClientId = targetUserId; // Fallback
        }
        if (!resolvedAdvocateId) {
          if (callerUser?.role === 'advocate') resolvedAdvocateId = socket.userId;
          else if (targetUser?.role === 'advocate') resolvedAdvocateId = targetUserId;
          else resolvedAdvocateId = socket.userId; // Fallback
        }

        // Notify target — they will open VideoCallScreen or AdvocateCallScreen
        io.to(`user:${targetUserId}`).emit("incoming_call", {
          bookingId:     bookingId || null,
          chatId:        chatId || null,
          zegoRoomId:    bookingDetails.zegoRoomId || zegoRoomId,
          advocateToken: bookingDetails.advocateToken,
          zegoAppId:     bookingDetails.zegoAppId || 0,
          clientName:    callerUser?.name || (bookingDetails.isClientCalling ? 'Client' : 'Advocate'),
          clientAvatar:  callerUser?.avatar || null,
          clientId:      resolvedClientId,
          advocateUserId: resolvedAdvocateId,
          mode:          mode || 'video',
        });

        logger.info(`[CALL] initiate_call: caller=${socket.userId} → target=${targetUserId} | booking=${bookingId}`);

        // Push notification if target is offline
        const isTargetOnline = onlineUsers.has(targetUserId) && onlineUsers.get(targetUserId).size > 0;
        if (!isTargetOnline && targetUser?.expoPushToken) {
          const pushTitle = `${mode === 'video' ? '📹' : '📞'} Incoming Call`;
          const pushBody = `${callerUser?.name || 'Someone'} is calling you. Tap to join.`;
          await sendPushNotification(
            targetUser.expoPushToken,
            pushTitle,
            pushBody,
            { 
              type: 'incoming_call', 
              bookingId: bookingId || null, 
              chatId: chatId || null,
              zegoRoomId: bookingDetails.zegoRoomId || zegoRoomId,
              mode: mode || 'video',
              clientId: resolvedClientId,
              advocateUserId: resolvedAdvocateId,
              callerName: callerUser?.name || 'Someone'
            }
          );
        }
      } catch (err) {
        logger.error("initiate_call error:", err.message);
      }
    });

    // Either party can emit this to notify the other that call ended
    socket.on("call_ended", async ({ bookingId, clientId, advocateUserId }) => {
      try {
        let finalClientId = clientId;
        let finalAdvocateUserId = advocateUserId;

        // If IDs are missing, fetch from booking
        if (!finalClientId || !finalAdvocateUserId) {
          if (bookingId) {
            const booking = await Booking.findById(bookingId).lean();
            if (booking) {
              finalClientId = booking.client?.toString();
              if (booking.advocate) {
                const advocate = await Advocate.findById(booking.advocate).lean();
                finalAdvocateUserId = advocate?.user?.toString();
              }
            }
          }
        }

        if (finalClientId && finalClientId !== socket.userId) {
          io.to(`user:${finalClientId}`).emit("call_ended", { bookingId });
        }
        if (finalAdvocateUserId && finalAdvocateUserId !== socket.userId) {
          io.to(`user:${finalAdvocateUserId}`).emit("call_ended", { bookingId });
        }
        logger.info(`[CALL] call_ended: emitter=${socket.userId} booking=${bookingId}`);
      } catch (err) {
        logger.error("call_ended error:", err.message);
      }
    });

    // ── DISCONNECT ─────────────────────────────────────────────
    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected: ${socket.userId} (${reason})`);
      const sockets = onlineUsers.get(socket.userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(socket.userId);
          io.emit("user_offline", { userId: socket.userId });
          // Update lastSeen in DB (fire and forget)
          User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() }).catch(() => {});
        }
      }
    });
  });

  logger.info("Socket.io initialized");
  return io;
};

const getIO = () => { if (!io) throw new Error("Socket not initialized"); return io; };
module.exports = { initSocket, getIO };
