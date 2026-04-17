const Razorpay = require('razorpay');
const logger = require('../utils/logger');

let razorpay;

const getInstance = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

exports.createOrder = async (amount, notes = '') => {
  try {
    const order = await getInstance().orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      notes: { description: notes },
    });
    return order;
  } catch (err) {
    logger.error('Razorpay createOrder error:', err.message);
    throw err;
  }
};

exports.fetchPayment = async (paymentId) => {
  return getInstance().payments.fetch(paymentId);
};
