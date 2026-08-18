import React, { useEffect, Component } from 'react';
import { Platform, View, Text, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import AppNavigator from './src/navigation/AppNavigator';

// Keep splash screen visible while we load (native only)
if (Platform.OS !== 'web') {
  try {
    SplashScreen.preventAutoHideAsync();
  } catch (e) { }
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
