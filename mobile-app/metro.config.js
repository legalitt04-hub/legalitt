const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ─── Web-safe polyfill paths ─────────────────────────────────────────────────
const NOOP = path.resolve(__dirname, 'src/utils/polyfills/noopPolyfill.js');
const RAZORPAY = path.resolve(__dirname, 'src/utils/polyfills/razorpayPolyfill.js');
const SOUND = path.resolve(__dirname, 'src/utils/polyfills/soundPolyfill.js');
const KEEP_AWAKE = path.resolve(__dirname, 'src/utils/keepAwakePolyfill.js');

// ─── Platform-aware module resolver ──────────────────────────────────────────
// For web builds, redirect native-only packages to safe stubs.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // Zego video call SDK — native-only
    if (
      moduleName.includes('zego-express-engine') ||
      moduleName.includes('zego-zim') ||
      moduleName.includes('@zegocloud') ||
      moduleName.includes('zego-express') ||
      moduleName.startsWith('zego')
    ) {
      return { type: 'sourceFile', filePath: NOOP };
    }

    // Payment — native-only
    if (moduleName === 'react-native-razorpay') {
      return { type: 'sourceFile', filePath: RAZORPAY };
    }

    // Audio — native-only
    if (moduleName === 'react-native-sound') {
      return { type: 'sourceFile', filePath: SOUND };
    }

    // Keep Awake
    if (moduleName === '@sayem314/react-native-keep-awake') {
      return { type: 'sourceFile', filePath: KEEP_AWAKE };
    }
  }

  // Default resolver for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
