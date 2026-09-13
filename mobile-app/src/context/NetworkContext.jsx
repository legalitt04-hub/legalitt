import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncOfflineQueue } from '../utils/offlineQueue';

const NetworkContext = createContext({ isConnected: true });

/**
 * NetworkProvider — Provides real-time connectivity state to the whole app.
 *
 * Key fixes applied:
 * 1. Starts as `true` (connected) — prevents false "Offline" banner on startup
 *    because NetInfo fires `null` for isConnected during the first ~300ms.
 * 2. `NetInfo.fetch()` on mount gives the real initial state immediately.
 * 3. 2-second debounce before marking offline — prevents false "Offline" flashes
 *    during WiFi→5G handoffs or brief signal hiccups.
 * 4. `state.isConnected !== false` treats `null` as "unknown = assume connected".
 */
export const NetworkProvider = ({ children }) => {
  // ✅ Start as true — never show false offline banner on app startup
  const [isConnected, setIsConnected] = useState(true);
  const offlineTimerRef = useRef(null);

  useEffect(() => {
    // Get real initial connectivity state ASAP (synchronous-like fetch)
    NetInfo.fetch().then(state => {
      // Only mark offline if explicitly false (NOT null)
      if (state.isConnected === false) {
        setIsConnected(false);
      }
    }).catch(() => {
      // If fetch fails, stay connected (assume online)
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      // null = transitioning / unknown → assume connected to avoid false banner
      const nowConnected = state.isConnected !== false;

      if (nowConnected) {
        // Back online — clear debounce timer and update immediately
        if (offlineTimerRef.current) {
          clearTimeout(offlineTimerRef.current);
          offlineTimerRef.current = null;
        }
        setIsConnected(true);

        // Drain any queued offline mutations
        syncOfflineQueue();
      } else {
        // Only mark offline after 2 seconds of sustained disconnection.
        // This prevents flickering banner during WiFi ↔ 5G handoff.
        if (!offlineTimerRef.current) {
          offlineTimerRef.current = setTimeout(() => {
            offlineTimerRef.current = null;
            setIsConnected(false);
          }, 2000);
        }
      }
    });

    return () => {
      unsubscribe();
      if (offlineTimerRef.current) {
        clearTimeout(offlineTimerRef.current);
      }
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
