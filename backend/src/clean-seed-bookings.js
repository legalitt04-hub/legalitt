const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const Advocate = require('./models/Advocate');
const User = require('./models/User');
const { Chat, Message } = require('./models/Chat');

async function cleanSeedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB successfully.');

    // 1. Get seeded advocate user IDs
    const seedUsers = await User.find({ email: /@legalitt-seed\.com$/i }).lean();
    const seedUserIds = seedUsers.map(u => u._id);

    // 2. Find advocate profiles corresponding to seed users
    const seedAdvocates = await Advocate.find({ user: { $in: seedUserIds } }).lean();
    const seedAdvocateIds = seedAdvocates.map(a => a._id);

    // 3. Delete seeded bookings
    const bookingResult = await Booking.deleteMany({
      $or: [
        { advocate: { $in: seedAdvocateIds } },
        { client: { $in: seedUserIds } }
      ]
    });
    console.log(`🧹 Deleted ${bookingResult.deletedCount} seeded bookings from the database.`);

    // 4. Delete corresponding chats & messages that are linked to seed users
    const chatResult = await Chat.deleteMany({
      participants: { $in: seedUserIds }
    });
    console.log(`🧹 Deleted ${chatResult.deletedCount} seeded chats from the database.`);

    // We can also clear all messages that belong to deleted chats
    // First find all chats left in the DB
    const activeChats = await Chat.find().select('_id').lean();
    const activeChatIds = activeChats.map(c => c._id);
    const msgResult = await Message.deleteMany({
      chat: { $nin: activeChatIds }
    });
    console.log(`🧹 Deleted ${msgResult.deletedCount} orphaned messages from the database.`);

    console.log('✅ Clean up complete! Only your real registered test accounts and booking data are kept.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning seed data:', error);
    process.exit(1);
  }
}

cleanSeedData();
