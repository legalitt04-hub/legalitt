/**
 * src/utils/GoogleSigninMock.js
 * Cross-platform Google Sign-In mock/shim.
 * Native TurboModule 'RNGoogleSignin' is not present in Expo Go.
 */

const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
};

const GoogleSignin = {
  configure: () => {},
  hasPlayServices: async () => true,
  signIn: async () => {
    throw new Error('Google Sign-In requires a standalone build or EAS development build. In Expo Go, please sign in with Email/Password or Phone OTP.');
  },
  signOut: async () => {},
  revokeAccess: async () => {},
  isSignedIn: () => false,
  getCurrentUser: () => null,
  getTokens: async () => ({ idToken: '', accessToken: '' }),
};

export { GoogleSignin, statusCodes };
export default GoogleSignin;
