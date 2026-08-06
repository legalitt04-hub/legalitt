import { useState, useEffect, useCallback } from 'react';
import { bookingAPI } from '../services/api';

/**
 * Hook for a client's booking history with status filtering.
 */
export const useMyBookings = (status) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (status) params.status = status;
      const { data } = await bookingAPI.getMy(params);
      setBookings(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetch(); }, [fetch]);

  return { bookings, loading, error, refetch: fetch };
};

/**
 * Hook for an advocate's incoming bookings.
 */
export const useAdvocateBookings = (status, today) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (status) params.status = status;
      if (today) params.today = 'true';
      const { data } = await bookingAPI.getAdvocateBookings(params);
      setBookings(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [status, today]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = useCallback(async (bookingId, newStatus, reason) => {
    try {
      await bookingAPI.updateStatus(bookingId, { status: newStatus, cancellationReason: reason });
      await fetch(); // Refresh list
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Update failed' };
    }
  }, [fetch]);

  return { bookings, loading, error, refetch: fetch, updateStatus };
};
