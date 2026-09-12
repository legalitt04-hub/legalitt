import React, { useEffect, Component } from 'react';
import { Platform, View, Text, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { PricingProvider } from './src/context/PricingContext';
import AppNavigator from './src/navigation/AppNavigator';
import api from './src/services/api';

// Keep splash screen visible while we load (native only)
if (Platform.OS !== 'web') {
  try {
    SplashScreen.preventAutoHideAsync();
  } catch (e) { }
}

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerPushToken() {
  try {
    if (Platform.OS === 'web') return;
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('[Push] Permission denied');
      return;
    }
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;
    console.log('[Push] Token registered:', pushToken);
    // Send to backend (POST /api/v1/auth/fcm-token)
    await api.post('/auth/fcm-token', { fcmToken: pushToken });
  } catch (err) {
    console.warn('[Push] Registration failed:', err.message);
  }
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#1a0000' }}>
          <Text style={{ color: '#ff4d4d', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
            ⚠️ Something went wrong
          </Text>
          <ScrollView>
            <Text style={{ color: '#ffffff', fontSize: 14, marginBottom: 16 }}>
              {this.state.error?.toString()}
            </Text>
            <Text style={{ color: '#999999', fontSize: 10 }}>
              {this.state.error?.stack}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

// Inner component that can access AuthContext
function AppWithPush() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      registerPushToken();
    }
  }, [isAuthenticated]);

  return (
    <>
      <AppNavigator />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, minHeight: Platform.OS === 'web' ? '100vh' : '100%', backgroundColor: '#000000' }}>
        <SafeAreaProvider style={{ flex: 1, minHeight: Platform.OS === 'web' ? '100vh' : '100%' }}>
          <NetworkProvider>
            <PricingProvider>
              <AuthProvider>
                <AppWithPush />
              </AuthProvider>
            </PricingProvider>
          </NetworkProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
