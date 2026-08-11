import React, { useEffect, Component } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import AppNavigator from './src/navigation/AppNavigator';

// Lazy-load expo-notifications — static import crashes if native module
// (ExpoPushTokenManager) is not registered (e.g. Firebase not linked yet).
let Notifications = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.warn('[App] expo-notifications native module not available:', e?.message);
}

// Keep splash screen visible while we load (native only)
if (Platform.OS !== 'web') {
  try {
    SplashScreen.preventAutoHideAsync();
  } catch (e) { }

  // Configure notification handler only if module loaded successfully
  if (Notifications) {
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (e) {
      console.warn('[App] setNotificationHandler failed:', e?.message);
    }
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
        <div style={{ padding: 20, paddingTop: 50, color: 'red' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 10 }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    // Native splash screen hiding is managed smoothly when intro screen assets are ready
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, minHeight: Platform.OS === 'web' ? '100vh' : '100%', backgroundColor: '#000000' }}>
        <SafeAreaProvider style={{ flex: 1, minHeight: Platform.OS === 'web' ? '100vh' : '100%' }}>
          <NetworkProvider>
            <AuthProvider>
              <AppNavigator />
              <Toast />
            </AuthProvider>
          </NetworkProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
