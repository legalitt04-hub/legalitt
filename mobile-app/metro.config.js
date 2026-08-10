const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Safe fallback resolver for native modules when running in Expo Go / Dev mode
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@sayem314/react-native-keep-awake': path.resolve(__dirname, 'src/utils/keepAwakePolyfill.js'),
};

module.exports = config;
