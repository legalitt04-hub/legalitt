import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { authAPI } from '../services/api';

/**
 * Registers the device for push notifications and updates the FCM token on the server.
 * Call this hook once after the user logs in.
 */
export const useNotifications = (isAuthenticated) => {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!isAuthenticated) return;

    const register = async () => {
      try {
        // Request permission
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') return;

        // Get Expo push token (works for both FCM and APNS)
        const token = (await Notifications.getExpoPushTokenAsync()).data;

        // Send token to backend
        await authAPI.updateFCMToken(token);

        // Android channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Legalitt',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#0d9488',
          });
        }
      } catch { /* Silently ignore push registration failures */ }
    };

    register();

    // Listen for notifications while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Optionally show in-app notification banner here
    });

    // Handle notification tap
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      // Navigate based on notification type — handled in App.jsx via navigation ref
      if (data?.bookingId) {
        // navigation.navigate('MyBookings') — pass nav ref if needed
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [isAuthenticated]);
};
