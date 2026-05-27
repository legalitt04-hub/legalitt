import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

// Jabalpur, MP — default for Indian legal market
const DEFAULT_COORDS = { latitude: 23.1815, longitude: 79.9864 };

/**
 * Requests foreground location permission and returns current coords.
 * Falls back to Jabalpur (HQ city) if denied or unavailable.
 */
export const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isDefault, setIsDefault] = useState(false);

  const getLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setCoords(DEFAULT_COORDS);
        setIsDefault(true);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
      });

      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
      setIsDefault(false);
    } catch (err) {
      setError(err.message);
      setCoords(DEFAULT_COORDS);
      setIsDefault(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { getLocation(); }, [getLocation]);

  return { coords, loading, error, permissionStatus, isDefault, refresh: getLocation };
};

/**
 * Converts lat/lng to a human-readable address (reverse geocode).
 */
export const useReverseGeocode = (coords) => {
  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;

    const geocode = async () => {
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        if (!cancelled && results?.[0]) {
          const r = results[0];
          setAddress([r.street, r.city, r.region].filter(Boolean).join(', '));
        }
      } catch { /* silently ignore */ }
    };

    geocode();
    return () => { cancelled = true; };
  }, [coords?.latitude, coords?.longitude]);

  return address;
};
