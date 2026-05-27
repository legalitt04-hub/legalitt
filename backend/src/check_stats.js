const mongoose = require('mongoose');
require('dotenv').config();
const Advocate = require('./models/Advocate');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const total = await Advocate.countDocuments({ isVerified: true, verificationStatus: 'approved' });
    console.log('Total Approved Advocates:', total);

    const cityStats = await Advocate.aggregate([
      { $match: { isVerified: true, verificationStatus: 'approved' } },
      { $group: { _id: '$location.address.city', count: { $sum: 1 } } } ]);

    console.log('City-wise Stats:');
    cityStats.forEach(stat => {
      console.log(`- ${stat._id || 'No City'}: ${stat.count}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
