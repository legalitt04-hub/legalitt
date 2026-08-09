// src/services/dailyService.js
// Daily.co Video & Voice Call Room Management
// Free tier: 10,000 participant-minutes/month
// API Docs: https://docs.daily.co/reference

const axios = require('axios');
const logger = require('../utils/logger');

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_BASE = process.env.DAILY_API_BASE || 'https://api.daily.co/v1';

const dailyAPI = axios.create({
  baseURL: DAILY_BASE,
  headers: {
    Authorization: `Bearer ${DAILY_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Create a new Daily.co room for a booking
 * Returns: roomName, roomUrl
 */
const createRoom = async ({ bookingId, expiryHours = 2 }) => {
  if (!DAILY_API_KEY) {
    logger.warn('[Daily.co] DAILY_API_KEY not set. Returning mock room for development.');
    const mockRoom = `legalitt-${bookingId}-dev`;
    return {
      success: true,
      dev: true,
      roomName: mockRoom,
      roomUrl: `https://legalitt.daily.co/${mockRoom}`,
      expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
    };
  }

  try {
    const expiryTime = Math.floor(Date.now() / 1000) + expiryHours * 60 * 60;
    const roomName = `legalitt-${bookingId}-${Date.now()}`;

    const { data } = await dailyAPI.post('/rooms', {
      name: roomName,
      privacy: 'private', // Requires token to join — secure
      properties: {
        exp: expiryTime,
        enable_chat: true,
        enable_screenshare: false,
        max_participants: 2, // Only client + advocate
        start_video_off: false,
        start_audio_off: false,
        enable_knocking: false,
        eject_at_room_exp: true, // Auto-kick when room expires
      },
    });

    logger.info(`[Daily.co] Room created: ${data.name}`);
    return {
      success: true,
      roomName: data.name,
      roomUrl: data.url,
      expiresAt: new Date(expiryTime * 1000),
    };
  } catch (err) {
    logger.error('[Daily.co] Failed to create room:', err.response?.data || err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Create a meeting token for a participant (client or advocate)
 * Tokens ensure only authorized users can join the room
 */
const createMeetingToken = async ({ roomName, userId, userName, isOwner = false, expiryHours = 2 }) => {
  if (!DAILY_API_KEY) {
    // Mock token for development
    return {
      success: true,
      dev: true,
      token: `dev-token-${userId}-${Date.now()}`,
    };
  }

  try {
    const expiryTime = Math.floor(Date.now() / 1000) + expiryHours * 60 * 60;

    const { data } = await dailyAPI.post('/meeting-tokens', {
      properties: {
        room_name: roomName,
        user_id: String(userId),
        user_name: userName,
        is_owner: isOwner, // Advocate gets owner rights (can end call)
        exp: expiryTime,
        start_video_off: false,
        start_audio_off: false,
        enable_recording: false,
      },
    });

    logger.info(`[Daily.co] Token created for ${userName} in room ${roomName}`);
    return { success: true, token: data.token };
  } catch (err) {
    logger.error('[Daily.co] Failed to create token:', err.response?.data || err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Full setup: Create room + tokens for both client and advocate
 * Called when admin assigns an advocate to a booking
 */
const setupCallRoom = async ({ bookingId, clientId, clientName, advocateUserId, advocateName }) => {
  try {
    // Create room
    const room = await createRoom({ bookingId, expiryHours: 24 }); // Room valid for 24h
    if (!room.success) return { success: false, error: room.error };

    // Create client token
    const clientToken = await createMeetingToken({
      roomName: room.roomName,
      userId: clientId,
      userName: clientName,
      isOwner: false,
      expiryHours: 24,
    });

    // Create advocate token (is owner so they can end the call)
    const advocateToken = await createMeetingToken({
      roomName: room.roomName,
      userId: advocateUserId,
      userName: advocateName,
      isOwner: true,
      expiryHours: 24,
    });

    return {
      success: true,
      roomName: room.roomName,
      roomUrl: room.roomUrl,
      expiresAt: room.expiresAt,
      clientToken: clientToken.token,
      advocateToken: advocateToken.token,
    };
  } catch (err) {
    logger.error('[Daily.co] setupCallRoom failed:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Delete a room (cleanup after call ends)
 */
const deleteRoom = async (roomName) => {
  if (!DAILY_API_KEY || !roomName) return;
  try {
    await dailyAPI.delete(`/rooms/${roomName}`);
    logger.info(`[Daily.co] Room deleted: ${roomName}`);
  } catch (err) {
    logger.error('[Daily.co] Failed to delete room:', err.message);
  }
};

module.exports = { createRoom, createMeetingToken, setupCallRoom, deleteRoom };
