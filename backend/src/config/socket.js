const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const Message = require("../models/Message");
const { Chat } = require("../models/Chat");

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
      origin: [process.env.FRONTEND_URL,"http://localhost:3000","http://localhost:8081","exp://localhost:8081"].filter(Boolean),
      methods: ["GET","POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket","polling"],
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

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.userId}`);
    socket.join(`user:${socket.userId}`);

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

    socket.on("send_message", async ({ chatId, content, messageType="text", fileUrl, fileName }) => {
      try {
        const chat = await Chat.findById(chatId).lean();
        if (!chat) return socket.emit("error", { message: "Chat not found" });
        const ok = chat.participants.some(p => p.toString() === socket.userId);
        if (!ok) return socket.emit("error", { message: "Not authorized" });

        const message = await Message.create({
          chat: chatId, sender: socket.userId,
          content: content?.substring(0, 5000),
          messageType, fileUrl, fileName,
        });
        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id, updatedAt: new Date() });
        const populated = await message.populate("sender", "name avatar");
        io.to(`chat:${chatId}`).emit("new_message", populated);
        chat.participants.forEach(pid => {
          if (pid.toString() !== socket.userId)
            io.to(`user:${pid}`).emit("message_notification", { chatId, message: { content, senderName: populated.sender?.name } });
        });
      } catch (err) { logger.error("send_message:", err.message); socket.emit("error", { message: "Failed" }); }
    });

    socket.on("typing",      ({ chatId }) => socket.to(`chat:${chatId}`).emit("user_typing", { userId: socket.userId }));
    socket.on("stop_typing", ({ chatId }) => socket.to(`chat:${chatId}`).emit("user_stopped_typing", { userId: socket.userId }));

    socket.on("mark_read", async ({ chatId }) => {
      try {
        await Message.updateMany({ chat: chatId, sender: { $ne: socket.userId }, readAt: null }, { readAt: new Date() });
        socket.to(`chat:${chatId}`).emit("messages_read", { chatId, userId: socket.userId, readAt: new Date() });
      } catch (err) { logger.error("mark_read:", err.message); }
    });

    socket.on("disconnect", reason => logger.info(`Socket disconnected: ${socket.userId} (${reason})`));
  });

  logger.info("Socket.io initialized");
  return io;
};

const getIO = () => { if (!io) throw new Error("Socket not initialized"); return io; };
module.exports = { initSocket, getIO };
