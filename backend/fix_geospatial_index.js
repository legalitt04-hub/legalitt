require('dotenv').config();
const mongoose = require('mongoose');
const Advocate = require('./src/models/Advocate');

const fixIndexes = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop existing indexes (except _id)
    console.log('\n🗑️  Dropping old indexes...');
    await Advocate.collection.dropIndexes();
    console.log('✅ Old indexes dropped');

    // Recreate all indexes from schema
    console.log('\n🔨 Creating new indexes...');
    await Advocate.createIndexes();
    console.log('✅ Indexes created');

    // Verify the 2dsphere index exists
    console.log('\n📊 Current indexes:');
    const indexes = await Advocate.collection.getIndexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Test query
    console.log('\n🧪 Testing geospatial query...');
    const testLat = 22.7196;
    const testLng = 75.8577;
    const testRadius = 5; // km

    const count5km = await Advocate.countDocuments({
      isVerified: true,
      verificationStatus: 'approved',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [testLng, testLat],
          },
          $maxDistance: testRadius * 1000,
        },
      },
    });

    const count10km = await Advocate.countDocuments({
      isVerified: true,
      verificationStatus: 'approved',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [testLng, testLat],
          },
          $maxDistance: 10 * 1000,
        },
      },
    });

    const count50km = await Advocate.countDocuments({
      isVerified: true,
      verificationStatus: 'approved',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [testLng, testLat],
          },
          $maxDistance: 50 * 1000,
        },
      },
    });

    console.log('\n📍 Results for Indore (22.7196, 75.8577):');
    console.log(`  5km radius:  ${count5km} advocates`);
    console.log(`  10km radius: ${count10km} advocates`);
    console.log(`  50km radius: ${count50km} advocates`);

    if (count5km === count10km && count10km === count50km) {
      console.log('\n⚠️  WARNING: Same count for all distances - data might be clustered or missing!');
    } else {
      console.log('\n✅ Distance filtering is working correctly!');
    }

    console.log('\n✨ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixIndexes();
