import { registerRootComponent } from 'expo';
import { NativeModules, Platform } from 'react-native';

// Global Web Error Handler to print any hidden JS crashes directly onto screen
if (typeof window !== 'undefined') {
  window.onerror = function (message, source, lineno, colno, error) {
    document.body.innerHTML = '<div style="color:#ff4d4d;font-family:sans-serif;font-size:16px;padding:24px;background:#050505;min-height:100vh;box-sizing:border-box;"><h2 style="color:#ff4d4d;">⚠️ WEB RUNTIME ERROR:</h2><p style="font-weight:bold;font-size:18px;">' + message + '</p><pre style="white-space:pre-wrap;background:#111;padding:16px;border-radius:8px;border:1px solid #333;color:#ccc;font-size:12px;">' + (error ? error.stack : 'Line: ' + lineno + ' Col: ' + colno + ' Source: ' + source) + '</pre></div>';
  };
  window.onunhandledrejection = function (event) {
    document.body.innerHTML = '<div style="color:#ffa500;font-family:sans-serif;font-size:16px;padding:24px;background:#050505;min-height:100vh;box-sizing:border-box;"><h2 style="color:#ffa500;">⚠️ UNHANDLED REJECTION:</h2><pre style="white-space:pre-wrap;background:#111;padding:16px;border-radius:8px;border:1px solid #333;color:#ccc;font-size:12px;">' + (event.reason ? (event.reason.stack || event.reason) : 'Unknown rejection') + '</pre></div>';
  };
}

// Fallback for ZegoCloud & Google NativeModules in Expo Go (Native only)
if (Platform.OS !== 'web' && NativeModules) {
  if (!NativeModules.ZegoExpressNativeModule) {
    NativeModules.ZegoExpressNativeModule = { prefix: 'zego' };
  }
  if (!NativeModules.ZIMNativeModule) {
    NativeModules.ZIMNativeModule = { prefix: 'zim' };
  }
  if (!NativeModules.RNGoogleSignin) {
    NativeModules.RNGoogleSignin = {
      BUTTON_SIZE_ICON: 0,
      BUTTON_SIZE_STANDARD: 0,
      BUTTON_SIZE_WIDE: 0,
      BUTTON_COLOR_AUTO: 0,
      BUTTON_COLOR_LIGHT: 0,
      BUTTON_COLOR_DARK: 0,
      SIGN_IN_CANCELLED: '0',
      IN_PROGRESS: '1',
      PLAY_SERVICES_NOT_AVAILABLE: '2',
      SIGN_IN_REQUIRED: '3',
      signIn: async () => ({}),
      configure: () => {},
      currentUserAsync: async () => null,
      signOut: async () => {},
    };
  }
}

import App from './App';
registerRootComponent(App);
