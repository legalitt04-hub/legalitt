import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { paymentAPI, bookingAPI } from '../services/api';

/**
 * Hook that manages the full Razorpay payment flow:
 * 1. Create order on backend
 * 2. Open Razorpay checkout
 * 3. Confirm payment on backend
 * 4. Return chat ID on success
 */
export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  /**
   * Initialise — creates the Razorpay order and stores the orderId.
   * Call this when the payment screen mounts.
   */
  const initOrder = useCallback(async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await paymentAPI.createOrder(bookingId);
      const { orderId: id, amount, keyId } = data.data;
      setOrderId(id);
      return { orderId: id, amount, keyId };
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not create payment order.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Opens Razorpay checkout and confirms the payment with the backend.
   *
   * In production builds (with react-native-razorpay installed):
   *   import RazorpayCheckout from 'react-native-razorpay';
   *   const result = await RazorpayCheckout.open({...});
   *
   * For Expo Go / preview builds we simulate success.
   */
  const pay = useCallback(async ({
    bookingId,
    orderId: oid,
    amount,
    keyId,
    userName,
    userEmail,
    userPhone,
    description,
  }) => {
    setLoading(true);
    setError(null);

    try {
      let paymentId;
      let signature;

      try {
        // Production path — react-native-razorpay (installed in EAS/native builds)
        const RazorpayCheckout = require('react-native-razorpay').default;
        const result = await RazorpayCheckout.open({
          description,
          image: 'https://legalitt.com/logo.png',
          currency: 'INR',
          key: keyId,
          amount: amount * 100,
          name: 'Legalitt',
          order_id: oid,
          prefill: {
            name: userName || '',
            email: userEmail || '',
            contact: userPhone || '',
          },
          theme: { color: '#0d9488' },
        });
        paymentId = result.razorpay_payment_id;
        signature = result.razorpay_signature;
      } catch (rzpErr) {
        if (rzpErr.code === 2) {
          // User dismissed the checkout — not an error
          setLoading(false);
          return { success: false, cancelled: true };
        }
        // Module not available (Expo Go) — use dev simulation
        paymentId = `pay_dev_${Date.now()}`;
        signature = 'dev_signature';
      }

      // Confirm payment on backend
      const { data } = await bookingAPI.confirmPayment({
        bookingId,
        razorpayOrderId: oid,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      });

      return { success: true, chatId: data.data.chatId, booking: data.data.booking };
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment failed. Please try again.';
      setError(msg);
      Alert.alert('Payment Failed', msg);
      return { success: false, cancelled: false };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, orderId, initOrder, pay };
};
