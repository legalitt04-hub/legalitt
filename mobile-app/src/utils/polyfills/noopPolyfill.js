// src/utils/polyfills/noopPolyfill.js
// Generic no-op stub for native-only SDKs (Zego, etc.) on web
const noopHandler = new Proxy({}, {
  get: (_, prop) => {
    if (prop === '__esModule') return true;
    if (prop === 'default') return noopHandler;
    return () => {};
  },
});

module.exports = noopHandler;
