import { useState, useEffect, useRef } from 'react';

export const useGeolocation = () => {
  const [location, setLocation]   = useState(null);
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const watchIdRef                = useRef(null);

  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // watchPosition keeps updating as GPS locks in more precisely
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          accuracy: pos.coords.accuracy, // metres — smaller = more precise
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        let msg = 'Location unavailable.';
        if (err.code === 1) msg = 'Location access denied. Please allow location in browser settings.';
        if (err.code === 2) msg = 'Could not determine location. Check GPS / WiFi.';
        if (err.code === 3) msg = 'Location timed out. Try again.';
        setError(msg);
        setLoading(false);
        // ❌ No fake fallback — don't silently set Jabalpur/Indore
      },
      {
        enableHighAccuracy: true,  // Use GPS chip, not WiFi/cell tower
        timeout:            15000, // Give GPS 15s to get a fix
        maximumAge:         10000, // Accept cached position up to 10s old
      }
    );
  };

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const retry = () => {
    stopWatching();
    setLocation(null);
    startWatching();
  };

  useEffect(() => {
    startWatching();
    return () => stopWatching(); // Cleanup on unmount
  }, []);

  return { location, error, loading, retry };
};
