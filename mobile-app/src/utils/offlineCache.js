import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptData, decryptData } from './security';

export const getCacheKey = (config) => {
  const url = config.url || '';
  
  // Only cache GET requests
  if (config.method && config.method.toLowerCase() !== 'get') {
    return null;
  }

  if (url === '/advocates/nearby' || url.startsWith('/advocates/nearby?')) {
    return 'cached_advocates_nearby';
  }
  if (url === '/advocates/specializations' || url.startsWith('/advocates/specializations?')) {
    return 'cached_advocates_specializations';
  }
  if (url === '/advocates/cities' || url.startsWith('/advocates/cities?')) {
    return 'cached_advocates_cities';
  }
  if (url === '/advocates/me' || url.startsWith('/advocates/me?')) {
    return 'cached_advocate_me';
  }
  if (url === '/users/me' || url.startsWith('/users/me?')) {
    return 'cached_user_me';
  }
  if (url === '/advocates' || url.startsWith('/advocates?')) {
    return 'cached_advocates_all';
  }

  // Single advocate profile: /advocates/ID (e.g. /advocates/65fca123...)
  const advocateIdMatch = url.match(/^\/advocates\/([a-zA-Z0-9_-]+)$/);
  if (advocateIdMatch) {
    return `cached_advocate_${advocateIdMatch[1]}`;
  }

  return null;
};

export const getCachedData = async (key) => {
  try {
    const rawData = await AsyncStorage.getItem(key);
    if (!rawData) return null;
    const decrypted = await decryptData(rawData);
    return decrypted ? JSON.parse(decrypted) : null;
  } catch (error) {
    console.error(`Error reading cache for key ${key}:`, error);
    return null;
  }
};

export const setCachedData = async (key, data) => {
  try {
    const dataString = JSON.stringify(data);
    const encrypted = await encryptData(dataString);
    await AsyncStorage.setItem(key, encrypted);
  } catch (error) {
    console.error(`Error writing cache for key ${key}:`, error);
  }
};
