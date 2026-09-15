// ─── TARGETED POLYFILLS FOR REACT NATIVE ──────────────────────────────────────
if (typeof global !== 'undefined') {
  if (typeof global.addEventListener !== 'function') global.addEventListener = function() {};
  if (typeof global.removeEventListener !== 'function') global.removeEventListener = function() {};
  if (typeof global.ShadowRoot === 'undefined') global.ShadowRoot = function ShadowRoot() {};
  if (typeof global.CSS === 'undefined') global.CSS = { supports: function() { return false; }, escape: function(v) { return v; } };
  if (typeof global.location === 'undefined' || global.location === null) {
    global.location = {
      href: 'https://app.legalitt.in/', host: 'app.legalitt.in', hostname: 'app.legalitt.in',
      protocol: 'https:', pathname: '/', search: '', hash: '', port: '',
      origin: 'https://app.legalitt.in',
      assign: function() {}, replace: function() {}, reload: function() {},
      toString: function() { return 'https://app.legalitt.in/'; },
    };
  }
  if (typeof global.Element === 'undefined') global.Element = function Element() {};
  if (typeof global.HTMLElement === 'undefined') global.HTMLElement = function HTMLElement() {};
  if (typeof global.Node === 'undefined') {
    global.Node = function Node() {};
    global.Node.ELEMENT_NODE = 1; global.Node.TEXT_NODE = 3; global.Node.DOCUMENT_NODE = 9;
  }
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
try {
  var RN = require('react-native');
  var originalNativeModules = RN.NativeModules || {};
  var customStubs = {
    ZegoExpressNativeModule: { prefix: 'zego' },
    ZIMNativeModule: { prefix: 'zim' },
  };
  var nativeModulesProxy = new Proxy(originalNativeModules, {
    get: function(target, prop, receiver) {
      if (prop in customStubs) return customStubs[prop];
      try { return Reflect.get(target, prop, receiver); } catch (e) { return undefined; }
    },
    set: function(target, prop, value) { customStubs[prop] = value; return true; }
  });
  Object.defineProperty(RN, 'NativeModules', {
    get: function() { return nativeModulesProxy; },
    configurable: true, enumerable: true,
  });
} catch (err) {}

// ─── Background Notification Task (Android EAS — app killed / background) ─────
// MUST be registered at the top level, before registerRootComponent.
// When a push notification arrives while app is killed, Expo wakes the JS runtime
// briefly to run this task. We store the call data so the UI can pick it up on open.
const BACKGROUND_NOTIFICATION_TASK = 'LEGALITT_BACKGROUND_CALL';

try {
  const TaskManager  = require('expo-task-manager');
  const Notifications = require('expo-notifications');

  // Register the background handler — runs even when app is killed
  TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
    if (error) { console.warn('[BGTask] Error:', error); return; }
    const notification = data?.notification;
    if (!notification) return;

    const payload = notification.request?.content?.data || {};

    // For incoming calls — store data so app can navigate when it opens
    if (payload.type === 'incoming_call') {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(
        'PENDING_INCOMING_CALL',
        JSON.stringify({
          ...payload,
          receivedAt: Date.now(),
        })
      );
    }
  });

  // Tell Expo to run the above task for every received notification
  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

} catch (err) {
  // Silent fallback — expo-task-manager not available in Expo Go
  console.log('[BGTask] Background task not registered:', err.message);
}

// ─── Register App ────────────────────────────────────────────────────────────
var registerRootComponent = require('expo').registerRootComponent;
var AppModule = require('./App');
var App = AppModule.default || AppModule;

registerRootComponent(App);
