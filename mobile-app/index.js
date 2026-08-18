// ─── TARGETED POLYFILLS FOR REACT NATIVE ──────────────────────────────────────
// IMPORTANT: We must NOT create a fake `document.createElement` because
// react-native-web's `canUseDOM` checks for it and if true, runs browser-only
// code that crashes on Android (e.g. `root instanceof ShadowRoot`).
//
// Instead, we only polyfill the specific globals that crash at module-load time.

if (typeof global !== 'undefined') {
  // ── window event listeners ─────────────────────────────────────────────────
  // Some packages call window.addEventListener at import time.
  // React Native has `global` but not full `window` API.
  if (typeof global.addEventListener !== 'function') {
    global.addEventListener = function() {};
  }
  if (typeof global.removeEventListener !== 'function') {
    global.removeEventListener = function() {};
  }

  // ── ShadowRoot ─────────────────────────────────────────────────────────────
  // Hermes throws ReferenceError (not just undefined) for `ShadowRoot`.
  // Even with canUseDOM=false, some deep import chains touch it at parse time.
  if (typeof global.ShadowRoot === 'undefined') {
    global.ShadowRoot = function ShadowRoot() {};
  }
  if (typeof global.CSS === 'undefined') {
    global.CSS = { supports: function() { return false; }, escape: function(v) { return v; } };
  }

  // ── window.location ────────────────────────────────────────────────────────
  // Analytics / routing packages read window.location.href at load time.
  // Only set if truly missing (React Native usually has it as undefined).
  if (typeof global.location === 'undefined' || global.location === null) {
    global.location = {
      href: 'https://app.legalitt.in/',
      host: 'app.legalitt.in',
      hostname: 'app.legalitt.in',
      protocol: 'https:',
      pathname: '/',
      search: '',
      hash: '',
      port: '',
      origin: 'https://app.legalitt.in',
      assign: function() {},
      replace: function() {},
      reload: function() {},
      toString: function() { return 'https://app.legalitt.in/'; },
    };
  }

  // ── Element / Node constructors ────────────────────────────────────────────
  // Some libs do `instanceof Element` checks.
  if (typeof global.Element === 'undefined') {
    global.Element = function Element() {};
  }
  if (typeof global.HTMLElement === 'undefined') {
    global.HTMLElement = function HTMLElement() {};
  }
  if (typeof global.Node === 'undefined') {
    global.Node = function Node() {};
    global.Node.ELEMENT_NODE = 1;
    global.Node.TEXT_NODE = 3;
    global.Node.DOCUMENT_NODE = 9;
  }

  // ── localStorage (used by some analytics / caching libs) ───────────────────
  if (typeof global.localStorage === 'undefined') {
    var _ls = {};
    global.localStorage = {
      getItem: function(k) { return _ls[k] !== undefined ? String(_ls[k]) : null; },
      setItem: function(k, v) { _ls[k] = String(v); },
      removeItem: function(k) { delete _ls[k]; },
      clear: function() { Object.keys(_ls).forEach(function(k) { delete _ls[k]; }); },
    };
  }
}

// ─── NativeModules stubs (must run before Zego imports) ──────────────────────
var RN = require('react-native');
if (RN.NativeModules) {
  if (!RN.NativeModules.ZegoExpressNativeModule) {
    RN.NativeModules.ZegoExpressNativeModule = { prefix: 'zego' };
  }
  if (!RN.NativeModules.ZIMNativeModule) {
    RN.NativeModules.ZIMNativeModule = { prefix: 'zim' };
  }
}

// ─── Register App ────────────────────────────────────────────────────────────
var registerRootComponent = require('expo').registerRootComponent;
var AppModule = require('./App');
var App = AppModule.default || AppModule;
registerRootComponent(App);
