const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const Advocate = require('./models/Advocate');
const User = require('./models/User');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const totalAdvocates = await Advocate.countDocuments();
    console.log('Total Advocates in DB:', totalAdvocates);

    const totalBookings = await Booking.countDocuments();
    console.log('Total Bookings in DB:', totalBookings);

    const paidBookings = await Booking.find({ 'payment.status': 'paid' })
      .populate({ path: 'advocate', populate: { path: 'user', select: 'name' } })
      .populate('client', 'name')
      .lean();

    console.log('Paid Bookings count:', paidBookings.length);
    paidBookings.forEach((b, i) => {
      console.log(`[${i+1}] ID: ${b._id}, Advocate User Name: ${b.advocate?.user?.name}, Advocate Profile ID: ${b.advocate?._id}, Client: ${b.client?.name}, Amount: ${b.payment?.amount}, Booking Status: ${b.status}, Payment Status: ${b.payment?.status}`);
    });

    const confirmedBookings = await Booking.find({ status: 'confirmed' })
      .populate({ path: 'advocate', populate: { path: 'user', select: 'name' } })
      .populate('client', 'name')
      .lean();

    console.log('Confirmed Bookings count:', confirmedBookings.length);
    confirmedBookings.forEach((b, i) => {
      console.log(`[${i+1}] ID: ${b._id}, Advocate User Name: ${b.advocate?.user?.name}, Advocate Profile ID: ${b.advocate?._id}, Client: ${b.client?.name}, Amount: ${b.payment?.amount}, Booking Status: ${b.status}, Payment Status: ${b.payment?.status}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
