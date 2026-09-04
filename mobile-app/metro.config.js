const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ─── Web & Expo Go Polyfill paths ─────────────────────────────────────────────
const NOOP = path.resolve(__dirname, 'src/utils/polyfills/noopPolyfill.js');
const RAZORPAY = path.resolve(__dirname, 'src/utils/polyfills/razorpayPolyfill.js');
const SOUND = path.resolve(__dirname, 'src/utils/polyfills/soundPolyfill.js');
const KEEP_AWAKE = path.resolve(__dirname, 'src/utils/keepAwakePolyfill.js');
const GOOGLE_SIGNIN = path.resolve(__dirname, 'src/utils/GoogleSigninMock.js');

// ─── Platform-aware module resolver ──────────────────────────────────────────
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // When building standalone APK on EAS, use real native packages instead of mocks
  if (process.env.EAS_BUILD === 'true') {
    return context.resolveRequest(context, moduleName, platform);
  }

  // Only in Expo Go & Web: stub native TurboModules that are not present in Expo Go client
  if (moduleName.includes('@react-native-google-signin/google-signin')) {
    return { type: 'sourceFile', filePath: GOOGLE_SIGNIN };
  }

  // Always stub KeepAwake — TurboModule 'ReactNativeKCKeepAwake' is not
  // present in Expo Go on any platform (android, ios, or web).
  if (moduleName === '@sayem314/react-native-keep-awake') {
    return { type: 'sourceFile', filePath: KEEP_AWAKE };
  }

  // Always stub react-native-sound — not linked in Expo Go
  if (moduleName === 'react-native-sound') {
    return { type: 'sourceFile', filePath: SOUND };
  }

  // Always stub Razorpay — not linked in Expo Go
  if (moduleName === 'react-native-razorpay') {
    return { type: 'sourceFile', filePath: RAZORPAY };
  }

  // Always stub Zego — native-only SDK, not in Expo Go
  if (
    moduleName.includes('zego-express-engine') ||
    moduleName.includes('zego-zim') ||
    moduleName.includes('@zegocloud') ||
    moduleName.includes('zego-express') ||
    moduleName.startsWith('zego')
  ) {
    return { type: 'sourceFile', filePath: NOOP };
  }

  // Default resolver for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
