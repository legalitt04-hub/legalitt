import * as SecureStore from 'expo-secure-store';

// Keys
export const KEYS = {
  ACCESS_TOKEN: 'legalitt_access_token',
  REFRESH_TOKEN: 'legalitt_refresh_token',
  ONBOARDING_DONE: 'legalitt_onboarding_done',
  USER_ROLE: 'legalitt_user_role',
  SELECTED_LANGUAGE: 'legalitt_language',
};

// ─── Secure Storage (tokens, sensitive data) ─────────────────────────────────

export const secureStorage = {
  get: async (key) => {
    try { return await SecureStore.getItemAsync(key); }
    catch { return null; }
  },
  set: async (key, value) => {
    try { await SecureStore.setItemAsync(key, String(value)); return true; }
    catch { return false; }
  },
  delete: async (key) => {
    try { await SecureStore.deleteItemAsync(key); return true; }
    catch { return false; }
  },
};

// ─── AsyncStorage-style helpers for non-sensitive prefs ──────────────────────
// Using in-memory fallback (replace with MMKV in production for performance)

const memStore = new Map();

export const storage = {
  get: (key) => {
    try { return memStore.get(key) ?? null; }
    catch { return null; }
  },
  set: (key, value) => {
    try { memStore.set(key, value); return true; }
    catch { return false; }
  },
  delete: (key) => {
    try { memStore.delete(key); return true; }
    catch { return false; }
  },
  has: (key) => memStore.has(key),
};

// ─── Token helpers ────────────────────────────────────────────────────────────

export const tokenStorage = {
  getAccessToken: () => secureStorage.get(KEYS.ACCESS_TOKEN),
  getRefreshToken: () => secureStorage.get(KEYS.REFRESH_TOKEN),
  setTokens: async (accessToken, refreshToken) => {
    await secureStorage.set(KEYS.ACCESS_TOKEN, accessToken);
    await secureStorage.set(KEYS.REFRESH_TOKEN, refreshToken);
  },
  clearTokens: async () => {
    await secureStorage.delete(KEYS.ACCESS_TOKEN);
    await secureStorage.delete(KEYS.REFRESH_TOKEN);
  },
};

// ─── Onboarding flag ─────────────────────────────────────────────────────────

export const hasCompletedOnboarding = async () => {
  const val = await secureStorage.get(KEYS.ONBOARDING_DONE);
  return val === 'true';
};

export const markOnboardingDone = () =>
  secureStorage.set(KEYS.ONBOARDING_DONE, 'true');
