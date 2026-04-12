import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      err => {
        setError('Unable to get your location. Using default: Jabalpur.');
        setLocation({ lat: 23.1815, lng: 79.9864 }); // Default: Indore
        setLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  useEffect(() => { getLocation(); }, []);

  return { location, error, loading, retry: getLocation };
};
