import { useState, useCallback, useRef } from 'react';
import { advocateAPI } from '../services/api';

export const useAdvocates = () => {
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const abortRef = useRef(null);

  const fetchAdvocates = useCallback(async (params = {}) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const res = await advocateAPI.getAll(params);
      setAdvocates(res.data.data);
      setPagination(res.data.pagination || {});
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNearby = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await advocateAPI.getNearby(params);
      setAdvocates(res.data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { advocates, loading, error, pagination, fetchAdvocates, fetchNearby, setAdvocates };
};
