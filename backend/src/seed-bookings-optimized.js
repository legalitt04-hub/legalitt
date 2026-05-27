const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const Advocate = require('./models/Advocate');
const User = require('./models/User');
const { Chat } = require('./models/Chat');

async function seedBookingsOptimized() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB successfully.');

    // 1. Get seeded client
    const clientUser = await User.findOne({ email: 'client@legalitt.com' });
    if (!clientUser) {
      console.log('❌ Seeding failed: Seed client (client@legalitt.com) not found. Please run seed-client.js first!');
      process.exit(1);
    }

    // 2. Find all active test/seeded advocates (users with role advocate)
    // We will target all users with role 'advocate' who are active
    const advocateUsers = await User.find({ role: 'advocate' }).lean();
    const advocateUserIds = advocateUsers.map(u => u._id);

    console.log(`Found ${advocateUsers.length} advocate user accounts in the database.`);

    const advocates = await Advocate.find({ user: { $in: advocateUserIds } }).populate('user');
    if (advocates.length === 0) {
      console.log('❌ Seeding failed: No Advocate profiles found for advocate users.');
      process.exit(1);
    }

    console.log(`Found ${advocates.length} Advocate profiles to seed bookings for.`);

    // Clear existing bookings only for these specific test advocates
    const advocateIds = advocates.map(a => a._id);
    await Booking.deleteMany({ advocate: { $in: advocateIds } });
    console.log('🧹 Cleared existing bookings for these test advocates.');

    const now = new Date();

    // 3. Loop through advocates and create custom paid consultations
    for (const adv of advocates) {
      console.log(`Seeding bookings for Advocate: ${adv.user?.name} (${adv.user?.email})`);

      // We will create:
      // - 1 Today paid consultation
      // - 1 Paid consultation 3 days ago (This Week)
      // - 1 Paid consultation 15 days ago (This Month)
      // - 1 Paid consultation 45 days ago (Last Month)
      // - 1 Paid consultation 75 days ago (2 Months Ago)

      const bookingSpecs = [
        {
          daysOffset: 0,
          amount: 1500,
          issue: 'Need advice on family property partition dispute.',
          type: 'in_person',
          timeSlot: { startTime: '10:00 AM', endTime: '10:30 AM' }
        },
        {
          daysOffset: -3,
          amount: 2500,
          issue: 'Unfair trade practice consumer case guidance.',
          type: 'video',
          timeSlot: { startTime: '02:00 PM', endTime: '02:30 PM' }
        },
        {
          daysOffset: -15,
          amount: 3500,
          issue: 'Corporate agreement review and drafting.',
          type: 'phone',
          timeSlot: { startTime: '04:00 PM', endTime: '04:30 PM' }
        },
        {
          daysOffset: -45,
          amount: 4500,
          issue: 'Filing bail application for an alleged check bounce case.',
          type: 'in_person',
          timeSlot: { startTime: '11:30 AM', endTime: '12:00 PM' }
        },
        {
          daysOffset: -75,
          amount: 5000,
          issue: 'Drafting response to standard legal notice.',
          type: 'video',
          timeSlot: { startTime: '01:00 PM', endTime: '01:30 PM' }
        }
      ];

      for (const spec of bookingSpecs) {
        const bookingDate = new Date(now);
        bookingDate.setDate(now.getDate() + spec.daysOffset);

        // Create Chat for each booking
        const chat = await Chat.create({
          participants: [clientUser._id, adv.user._id],
          isActive: true
        });

        await Booking.create({
          client: clientUser._id,
          advocate: adv._id,
          date: bookingDate,
          timeSlot: spec.timeSlot,
          type: spec.type,
          status: 'confirmed',
          issue: spec.issue,
          chat: chat._id,
          payment: {
            amount: spec.amount,
            currency: 'INR',
            status: 'paid',
            razorpayOrderId: 'order_' + Math.random().toString(36).substring(2, 11),
            razorpayPaymentId: 'pay_' + Math.random().toString(36).substring(2, 11),
            paidAt: bookingDate
          }
        });
      }
    }

    console.log('✅ Success! Bookings and paid transactions seeded successfully for active test advocates.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding bookings:', error);
    process.exit(1);
  }
}

seedBookingsOptimized();
