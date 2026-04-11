require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Advocate = require('../models/Advocate');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legalitt';

async function seed() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');

    const dataPath = path.join(__dirname, 'seed_data.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const advocates = JSON.parse(raw);

    console.log(`🗑️  Clearing existing advocates...`);
    await Advocate.deleteMany({});

    console.log(`🌱 Seeding ${advocates.length} advocates...`);
    await Advocate.insertMany(advocates, { ordered: false });

    // Create 2dsphere index
    await Advocate.collection.createIndex({ location: '2dsphere' });
    await Advocate.collection.createIndex({ name: 'text' });

    const count = await Advocate.countDocuments();
    console.log(`✅ Seeded ${count} advocates successfully!`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
