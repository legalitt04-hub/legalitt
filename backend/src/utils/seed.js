require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Advocate = require('../models/Advocate');

const advocates = [
  { name: 'Ajay Chohan', city: 'Indore', specializations: ['Criminal Law', 'Civil Law', 'Property Law'], experience: 15, fee: 800, lat: 22.7196, lng: 75.8577 },
  { name: 'Priya Sharma', city: 'Bhopal', specializations: ['Family Law', 'Civil Law'], experience: 8, fee: 600, lat: 23.2599, lng: 77.4126 },
  { name: 'Akshay Kumar', city: 'Jabalpur', specializations: ['Criminal Law', 'Constitutional Law'], experience: 12, fee: 700, lat: 23.1815, lng: 79.9864 },
  { name: 'Payal Verma', city: 'Indore', specializations: ['Corporate Law', 'Tax Law'], experience: 6, fee: 1000, lat: 22.7196, lng: 75.8477 },
  { name: 'Sushant Singh', city: 'Jabalpur', specializations: ['Family Law'], experience: 5, fee: 400, lat: 23.1715, lng: 79.9764 },
  { name: 'Rekha Gupta', city: 'Bhopal', specializations: ['Consumer Law', 'Labour Law'], experience: 10, fee: 500, lat: 23.2499, lng: 77.4026 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  // Clear existing
  await User.deleteMany({ email: /@legalitt-seed\.com$/ });

  for (const a of advocates) {
    const user = await User.create({
      name: a.name,
      email: `${a.name.toLowerCase().replace(/\s+/g, '.')}@legalitt-seed.com`,
      password: 'Seed@12345',
      role: 'advocate',
      isEmailVerified: true,
    });

    await Advocate.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        barCouncilNumber: `MP/${Math.floor(Math.random() * 9000) + 1000}/2024`,
        specializations: a.specializations,
        experience: a.experience,
        consultationFee: a.fee,
        followUpFee: Math.round(a.fee * 0.3),
        followUpDays: 7,
        location: {
          type: 'Point',
          coordinates: [a.lng, a.lat],
          address: { city: a.city, state: 'Madhya Pradesh' },
        },
        about: `${a.name} is an experienced advocate specializing in ${a.specializations.join(', ')}.`,
        languages: ['Hindi', 'English'],
        isVerified: true,
        verificationStatus: 'approved',
        isOnline: Math.random() > 0.5,
        'rating.average': (4 + Math.random()).toFixed(1),
        'rating.count': Math.floor(Math.random() * 200) + 50,
      },
      { upsert: true }
    );
    console.log(`Seeded: ${a.name}`);
  }

  // Create admin
  await User.findOneAndUpdate(
    { email: 'admin@legalitt.com' },
    { name: 'Admin', email: 'admin@legalitt.com', password: await bcrypt.hash('Admin@12345', 12), role: 'admin', isEmailVerified: true },
    { upsert: true }
  );
  console.log('Admin created: admin@legalitt.com / Admin@12345');
  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(console.error);
