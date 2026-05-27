import { useState, useEffect, useCallback, useRef } from 'react';
import { advocateAPI } from '../services/api';

/**
 * Hook for fetching and filtering advocate listings.
 * Handles loading, error, pagination, and location-based search.
 */
export const useAdvocates = (initialFilters = {}) => {
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const abortRef = useRef(null);

  const fetch = useCallback(async (pageNum = 1, reset = false) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current = false;
    const token = true;
    abortRef.current = token;

    if (pageNum === 1) setLoading(true);
    setError(null);

    try {
      const params = { ...filters, page: pageNum, limit: 10 };
      const { data } = await advocateAPI.getAll(params);
      if (!abortRef.current) return;

      const results = data.data || [];
      const pagination = data.pagination || {};

      if (reset || pageNum === 1) {
        setAdvocates(results);
      } else {
        setAdvocates(prev => [...prev, ...results]);
      }

      setHasMore(pageNum < (pagination.pages || 1));
      setPage(pageNum);
    } catch (err) {
      if (abortRef.current) setError(err.response?.data?.message || 'Failed to load advocates');
    } finally {
      if (abortRef.current) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch(1, true);
    return () => { abortRef.current = false; };
  }, [fetch]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetch(1, true);
    setRefreshing(false);
  }, [fetch]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetch(page + 1);
  }, [loading, hasMore, page, fetch]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  return {
    advocates, loading, refreshing, error,
    hasMore, filters,
    refresh, loadMore, updateFilters, clearFilters,
  };
};

/**
 * Hook for fetching a single advocate's full profile.
 */
export const useAdvocateProfile = (advocateId) => {
  const [advocate, setAdvocate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!advocateId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await advocateAPI.getAdvocate(advocateId);
      setAdvocate(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [advocateId]);

  useEffect(() => { refetch(); }, [refetch]);

  return { advocate, loading, error, refetch };
};

/**
 * Hook for nearby advocates using device GPS.
 */
export const useNearbyAdvocates = (coords, specialization) => {
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const params = {
          lat: coords.latitude,
          lng: coords.longitude,
          maxDistance: 25000,
        };
        if (specialization) params.specialization = specialization;
        const { data } = await advocateAPI.getNearby(params);
        if (!cancelled) setAdvocates(data.data || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to find nearby advocates');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [coords?.latitude, coords?.longitude, specialization]);

  return { advocates, loading, error };
};
