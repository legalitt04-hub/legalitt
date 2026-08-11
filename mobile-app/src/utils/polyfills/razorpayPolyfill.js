// src/utils/polyfills/razorpayPolyfill.js
// Web stub for react-native-razorpay — native module not available on web
const RazorpayCheckout = {
  open: async (options) => {
    console.warn('[Razorpay] Native payment not available on web. Options:', options);
    throw new Error('Razorpay is not supported on web. Use a mobile device for payments.');
  },
};

export default RazorpayCheckout;
module.exports = RazorpayCheckout;
