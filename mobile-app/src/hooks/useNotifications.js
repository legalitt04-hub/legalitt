import { useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Platform, AppState } from 'react-native';
import { authAPI } from '../services/api';
import { getSocket, connectSocket } from '../services/socket';

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

        if (finalStatus !== 'granted') {
          console.warn('[Push] Notification permission denied');
          return;
        }

        // Pass projectId explicitly so it works in both EAS dev client and production
        const projectId = Constants.expoConfig?.extra?.eas?.projectId
          || Constants.expoConfig?.extra?.projectId
          || 'c7cbf65c-ddc9-4089-afc6-30f135b6d5e8';

        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        const token = tokenData.data;
        console.log('[Push] ✅ Expo push token:', token);

        // Save token to backend so server can wake the device when app is killed
        try { await authAPI.updateFCMToken?.(token); } catch (_) {}

        // Android: high-priority channels (MAX for calls so it shows as heads-up)
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('calls', {
            name: 'Incoming Calls',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 200, 500],
            lightColor: '#B09C85',
            sound: 'default',
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            bypassDnd: true,            // show even in Do Not Disturb
            showBadge: true,
          });
          await Notifications.setNotificationChannelAsync('messages', {
            name: 'Messages',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250],
            lightColor: '#10B981',
            sound: 'default',
          });
        }
      } catch (err) {
        console.warn('[Push] Registration failed:', err?.message);
      }
    };

    register();

    // ── Foreground notification received (from Expo Push / remote) ──────────
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      // Notification already shown by handler above — no extra action needed
    });

    // ── Notification tapped → navigate ──────────────────────────────────────
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data || {};
      
      const tryNavigate = (attempt = 0) => {
        const nav = navigationRef?.current;
        if (!nav?.isReady?.()) {
          if (attempt < 10) setTimeout(() => tryNavigate(attempt + 1), 500);
          return;
        }

        if (data.type === 'new_message' && data.chatId) {
          nav.navigate('Chat', { chatId: data.chatId });
        } else if (data.type === 'incoming_call') {
          nav.navigate('IncomingCall', {
            ...data,
            callerName: data.clientName || data.callerName || 'Caller',
            callerAvatar: data.clientAvatar || data.callerAvatar || null,
            zegoToken: data.advocateToken || data.clientToken || null,
          });
        } else if (data.bookingId) {
          nav.navigate('MyBookings');
        }
      };
      
      tryNavigate();
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

  // ── Keep a ref to user so handlers always read the latest value ────────────
  const userRef = useRef(user);
  useLayoutEffect(() => { userRef.current = user; }, [user]);

  // ── Socket event listeners for foreground in-app notifications ─────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    let socket = null;
    let handleIncomingCall = null;
    let handleMessageNotif = null;
    let retryTimer = null;
    let didSetup = false; // prevent duplicate listener attachment

    const setupListeners = async () => {
      if (didSetup) return; // already attached

      // Try existing socket first, then connect if needed
      socket = getSocket();
      if (!socket || !socket.connected) {
        socket = await connectSocket();
      }
      if (!socket) {
        console.warn('[useNotifications] Socket unavailable — retrying in 3s');
        retryTimer = setTimeout(setupListeners, 3000);
        return;
      }

      didSetup = true;

      // ── Incoming Call (foreground) ──────────────────────────────────────────
      handleIncomingCall = (data) => {
        console.log('[useNotifications] incoming_call received:', data);
        const u = userRef.current; // always latest user — no stale closure
        const modeLabel    = data.mode === 'video' ? '📹 Video' : '📞 Voice';
        const callerName   = data.callerName || data.clientName || data.advocateName || 'Someone';
        const callerAvatar = data.callerAvatar || data.clientAvatar || null;

        const trySocketNavigate = (attempt = 0) => {
          const nav = navigationRef?.current;
          if (nav?.isReady?.()) {
            const currentUserRole = u?.role || u?.user?.role || 'client';
            const targetRoute     = currentUserRole === 'advocate' ? 'AdvocateCall' : 'VideoCall';
            const myId   = u?._id || u?.user?._id || u?.id || u?.user?.id || '';
            const myName = u?.name || u?.user?.name || 'Me';

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
          } else {
            if (attempt < 10) setTimeout(() => trySocketNavigate(attempt + 1), 500);
            else console.warn('[useNotifications] Nav not ready, dropping socket incoming_call');
          }
        };
        trySocketNavigate();

        // Local push if app is in background / inactive
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

      // ── New Message (foreground — only if not already in that chat) ─────────
      handleMessageNotif = (data) => {
        const senderName = data.message?.senderName || 'New message';
        const preview    = data.message?.content?.substring(0, 80) || '';
        scheduleLocalPush(
          `💬 ${senderName}`,
          preview,
          { type: 'new_message', chatId: data.chatId },
          'messages'
        );
      };

      socket.on('incoming_call',        handleIncomingCall);
      socket.on('message_notification', handleMessageNotif);
      console.log('[useNotifications] ✅ Listeners attached. Socket:', socket.id);
    };

    setupListeners();

    return () => {
      // Cancel any pending retry
      if (retryTimer) clearTimeout(retryTimer);
      // Remove listeners from socket
      if (socket && handleIncomingCall) {
        socket.off('incoming_call',        handleIncomingCall);
        socket.off('message_notification', handleMessageNotif);
      }
    };
  // Note: 'user' removed from deps — we use userRef for latest value without re-attaching
  }, [isAuthenticated, scheduleLocalPush]);
};
