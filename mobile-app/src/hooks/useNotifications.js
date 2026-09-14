import { useEffect, useRef, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import { authAPI } from '../services/api';
import { getSocket } from '../services/socket';

// Safe lazy-load: crashes if ExpoPushTokenManager native module is missing
let Notifications = null;
try { Notifications = require('expo-notifications'); } catch (e) {}

// ─── Configure foreground notification behaviour ──────────────────────────────
// Show banner + sound even when app is in foreground
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge:  true,
      }),
    });
  } catch (_) {}
}

/**
 * Registers the device for push notifications AND listens to socket events
 * to fire local push notifications for:
 *   - incoming_call  → "📞 Incoming Call" alert + push
 *   - new_message    → "💬 New Message" push
 *
 * Call this hook once after the user logs in.
 */
export const useNotifications = (isAuthenticated, navigationRef, user) => {
  const notificationListener = useRef();
  const responseListener     = useRef();

  // ── Register device for push ────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !Notifications) return;

    const register = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') return;

        // Get Expo push token (works for both FCM and APNS)
        const token = (await Notifications.getExpoPushTokenAsync()).data;

        // Send token to backend so server can push when user is offline
        try { await authAPI.updateFCMToken?.(token); } catch (_) {}

        // Android high-priority channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('calls', {
            name: 'Calls',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 200, 500],
            lightColor: '#B09C85',
            sound: 'default',
          });
          await Notifications.setNotificationChannelAsync('messages', {
            name: 'Messages',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250],
            lightColor: '#10B981',
            sound: 'default',
          });
        }
      } catch { /* Silently ignore push registration failures */ }
    };

    register();

    // ── Foreground notification received (from Expo Push / remote) ──────────
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      // Notification already shown by handler above — no extra action needed
    });

    // ── Notification tapped → navigate ──────────────────────────────────────
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data || {};
      const nav  = navigationRef?.current;
      if (!nav?.isReady?.()) return;

      if (data.type === 'new_message' && data.chatId) {
        nav.navigate('Chat', { chatId: data.chatId });
      } else if (data.type === 'incoming_call') {
        // Take them to the ringing screen so they can properly Accept/Decline
        nav.navigate('IncomingCall', {
          bookingId: data.bookingId,
          zegoRoomId: data.zegoRoomId,
          mode: data.mode,
          callerName: data.clientName || data.callerName || 'Caller',
          callerAvatar: data.clientAvatar || data.callerAvatar || null,
          clientId: data.clientId,
          advocateUserId: data.advocateUserId,
        });
      } else if (data.bookingId) {
        nav.navigate('MyBookings');
      }
    });

    return () => {
      if (notificationListener.current) {
        if (typeof notificationListener.current.remove === 'function') {
          notificationListener.current.remove();
        } else if (Notifications?.removeNotificationSubscription) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
      }
      if (responseListener.current) {
        if (typeof responseListener.current.remove === 'function') {
          responseListener.current.remove();
        } else if (Notifications?.removeNotificationSubscription) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      }
    };
  }, [isAuthenticated]);

  // ── Local push helper ───────────────────────────────────────────────────────
  const scheduleLocalPush = useCallback(async (title, body, data = {}, channelId = 'messages') => {
    if (!Notifications) return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          ...(Platform.OS === 'android' ? { channelId } : {}),
        },
        trigger: null, // show immediately
      });
    } catch (_) {}
  }, []);

  // ── Socket event listeners for foreground in-app notifications ─────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    // ── Incoming Call (foreground) ──────────────────────────────────────────
    const handleIncomingCall = (data) => {
      const modeLabel  = data.mode === 'video' ? '📹 Video' : '📞 Voice';
      // Backend now sends callerName directly; fall back to legacy fields
      const callerName   = data.callerName || data.clientName || data.advocateName || 'Someone';
      const callerAvatar = data.callerAvatar || data.clientAvatar || null;

      const nav = navigationRef?.current;
      if (nav?.isReady?.()) {
        const currentUserRole = user?.role || user?.user?.role || 'client';
        const targetRoute = currentUserRole === 'advocate' ? 'AdvocateCall' : 'VideoCall';
        // Extract the logged-in user's ID correctly from auth context
        const myId   = user?._id || user?.user?._id || user?.id || user?.user?.id || '';
        const myName = user?.name || user?.user?.name || 'Me';

        nav.navigate('IncomingCall', {
          callerName,
          callerAvatar,
          mode:           data.mode || 'video',
          zegoRoomId:     data.zegoRoomId,
          zegoToken:      data.advocateToken || data.clientToken || null,
          zegoAppId:      data.zegoAppId || 0,
          bookingId:      data.bookingId,
          clientId:       data.clientId,
          advocateUserId: data.advocateUserId,
          myUserId:       String(myId),
          myUserName:     myName,
          targetRoute,
        });
      }

      // Local push if app is in background
      if (AppState.currentState !== 'active') {
        scheduleLocalPush(
          `${modeLabel} Call Incoming!`,
          `${callerName} is calling you. Open the app to answer.`,
          {
            type:           'incoming_call',
            bookingId:      data.bookingId,
            zegoRoomId:     data.zegoRoomId,
            mode:           data.mode,
            clientId:       data.clientId,
            advocateUserId: data.advocateUserId,
            callerName,
          },
          'calls'
        );
      }
    };

    // ── New Message (foreground — only if not in that chat) ─────────────────
    const handleMessageNotif = (data) => {
      const senderName = data.message?.senderName || 'New message';
      const preview    = data.message?.content?.substring(0, 80) || '';

      scheduleLocalPush(
        `💬 ${senderName}`,
        preview,
        { type: 'new_message', chatId: data.chatId },
        'messages'
      );
    };

    socket.on('incoming_call',       handleIncomingCall);
    socket.on('message_notification', handleMessageNotif);

    return () => {
      socket.off('incoming_call',       handleIncomingCall);
      socket.off('message_notification', handleMessageNotif);
    };
  }, [isAuthenticated, scheduleLocalPush]);
};
