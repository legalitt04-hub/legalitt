import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';

const OFFLINE_QUEUE_KEY = 'legalitt_offline_queue';
const TOKEN_KEY = 'authToken';

// Get base URL dynamically from Constant/host config to prevent circular dependency
import Constants from 'expo-constants';
const debuggerHost = Constants.expoConfig?.hostUri;
const hostIp = debuggerHost ? debuggerHost.split(':')[0] : '10.0.2.2';
const DYNAMIC_BASE_URL = `http://${hostIp}:5001/api`;

export const getOfflineQueue = async () => {
  try {
    const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Error getting offline queue:', error);
    return [];
  }
};

export const saveOfflineQueue = async (queue) => {
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving offline queue:', error);
  }
};

export const addToOfflineQueue = async (requestConfig) => {
  try {
    const queue = await getOfflineQueue();
    
    // Prevent duplicate actions queued in a short window
    const isDuplicate = queue.some(item => 
      item.url === requestConfig.url && 
      item.method === requestConfig.method && 
      JSON.stringify(item.data) === JSON.stringify(requestConfig.data)
    );

    if (isDuplicate) {
      console.log('⚠️ Request already in queue, skipping duplicate.');
      return;
    }

    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: requestConfig.url,
      method: requestConfig.method,
      data: requestConfig.data,
      headers: requestConfig.headers,
      timestamp: Date.now(),
    };

    queue.push(newItem);
    await saveOfflineQueue(queue);

    Toast.show({
      type: 'info',
      text1: 'Working Offline',
      text2: 'Action saved and will sync when you are back online.',
      position: 'bottom',
      visibilityTime: 4000,
    });
  } catch (error) {
    console.error('Failed to add to offline queue:', error);
  }
};

let isSyncing = false;

export const syncOfflineQueue = async () => {
  if (isSyncing) return;
  
  const queue = await getOfflineQueue();
  if (queue.length === 0) return;

  isSyncing = true;
  console.log(`🔄 Syncing offline queue with ${queue.length} items...`);
  
  Toast.show({
    type: 'info',
    text1: 'Syncing Offline Actions',
    text2: `Uploading ${queue.length} pending action(s)...`,
    position: 'bottom',
    autoHide: false,
  });

  let remainingQueue = [...queue];

  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);

    for (const item of queue) {
      try {
        console.log(`📡 Syncing: ${item.method.toUpperCase()} ${item.url}`);
        
        await axios({
          url: `${DYNAMIC_BASE_URL}${item.url}`,
          method: item.method,
          data: item.data,
          headers: {
            ...item.headers,
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          timeout: 15000,
        });

        // Success: remove from remaining queue
        remainingQueue = remainingQueue.filter(q => q.id !== item.id);
        await saveOfflineQueue(remainingQueue);
      } catch (error) {
        console.error(`❌ Sync failed for ${item.url}:`, error.message);
        
        // If it's a network disconnection/timeout (server unreachable or no internet), halt sync to preserve execution order
        if (!error.response || error.response.status >= 500) {
          console.log('⚠️ Network or server error during sync. Halting queue execution.');
          break;
        }

        // If it's a validation error (4xx) except auth errors, discard since it's an invalid request payload
        if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 401 && error.response.status !== 403) {
          console.log(`🗑️ Discarding invalid request (status ${error.response.status})`);
          remainingQueue = remainingQueue.filter(q => q.id !== item.id);
          await saveOfflineQueue(remainingQueue);
        }
      }
    }
  } catch (err) {
    console.error('Critical error in offline sync queue loop:', err);
  } finally {
    isSyncing = false;
    Toast.hide();

    if (remainingQueue.length === 0) {
      Toast.show({
        type: 'success',
        text1: 'Sync Complete',
        text2: 'All actions synced successfully!',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Sync Incomplete',
        text2: `${remainingQueue.length} action(s) remaining. Will retry later.`,
        position: 'bottom',
        visibilityTime: 4000,
      });
    }
  }
};
