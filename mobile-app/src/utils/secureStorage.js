/**
 * src/utils/secureStorage.js
 * Cross-platform secure storage wrapper.
 * - Native (iOS/Android): uses expo-secure-store (encrypted keychain/keystore)
 * - Web: falls back to localStorage (not encrypted, but functional for dev/testing)
 */
import { Platform } from 'react-native';

let SecureStore = null;
if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
}

const WEB_PREFIX = '_legalitt_secure_';

export const setItemAsync = async (key, value) => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(WEB_PREFIX + key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.warn('[SecureStorage] setItemAsync error:', e?.message);
  }
};

export const getItemAsync = async (key) => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(WEB_PREFIX + key) || null;
      }
      return null;
    }
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    console.warn('[SecureStorage] getItemAsync error:', e?.message);
    return null;
  }
};

export const deleteItemAsync = async (key) => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(WEB_PREFIX + key);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch (e) {
    console.warn('[SecureStorage] deleteItemAsync error:', e?.message);
  }
};

export default { setItemAsync, getItemAsync, deleteItemAsync };
