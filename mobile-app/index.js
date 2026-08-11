// CRITICAL: Error handlers must be set before any imports execute
// so that module-level crashes are visible on screen instead of a blank white page.
if (typeof window !== 'undefined') {
  function showError(title, color, message, stack) {
    try {
      document.body.style.margin = '0';
      document.body.style.background = '#050505';
      document.body.innerHTML =
        '<div style="color:' + color + ';font-family:monospace;font-size:14px;padding:24px;background:#050505;min-height:100vh;box-sizing:border-box;">' +
        '<h2 style="color:' + color + ';margin:0 0 12px;">⚠️ ' + title + '</h2>' +
        '<p style="font-weight:bold;font-size:16px;color:#fff;margin:0 0 16px;">' + message + '</p>' +
        '<pre style="white-space:pre-wrap;background:#111;padding:16px;border-radius:8px;border:1px solid #333;color:#ccc;font-size:11px;overflow:auto;">' +
        (stack || 'No stack trace available') +
        '</pre></div>';
    } catch(e) { /* fallback: browser already broken */ }
  }

  window.onerror = function(message, source, lineno, colno, error) {
    showError(
      'WEB RUNTIME ERROR',
      '#ff4d4d',
      String(message),
      error ? error.stack : 'Source: ' + source + ' Line: ' + lineno + ':' + colno
    );
    return false;
  };

  window.onunhandledrejection = function(event) {
    const reason = event.reason;
    showError(
      'UNHANDLED PROMISE REJECTION',
      '#ffa500',
      reason ? String(reason.message || reason) : 'Unknown rejection',
      reason && reason.stack ? reason.stack : String(reason)
    );
  };
}

import { registerRootComponent } from 'expo';
import { NativeModules, Platform } from 'react-native';

// ─── NativeModules safety stubs ───────────────────────────────────────────────
// Zego SDK reads NativeModules at import-time on ALL platforms.
// We must stub them before any import of Zego runs (this is handled in metro config
// for web, but we keep stubs here as an extra safety net for Expo Go).
if (NativeModules) {
  if (!NativeModules.ZegoExpressNativeModule) {
    NativeModules.ZegoExpressNativeModule = { prefix: 'zego' };
  }
  if (!NativeModules.ZIMNativeModule) {
    NativeModules.ZIMNativeModule = { prefix: 'zim' };
  }
  if (!NativeModules.RNGoogleSignin && Platform.OS !== 'web') {
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

