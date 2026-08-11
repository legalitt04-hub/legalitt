/**
 * src/utils/GoogleSigninMock.js
 * Web-safe Google Sign-In shim.
 * On web: exports no-op stubs so the app doesn't crash on import.
 * On native: re-exports real @react-native-google-signin/google-signin.
 */
import { Platform } from 'react-native';

let GoogleSignin;
let statusCodes;

if (Platform.OS === 'web') {
  // Web stub — no native module available on web
  statusCodes = {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
  };
  GoogleSignin = {
    configure: () => {},
    signIn: async () => { throw new Error('Google Sign-In not available on web'); },
    signOut: async () => {},
    revokeAccess: async () => {},
    isSignedIn: () => false,
    getCurrentUser: () => null,
    getTokens: async () => { throw new Error('Google Sign-In not available on web'); },
    hasPlayServices: async () => false,
  };
} else {
  // Native — use the real package
  const native = require('@react-native-google-signin/google-signin');
  GoogleSignin = native.GoogleSignin;
  statusCodes = native.statusCodes;
}

export { GoogleSignin, statusCodes };
