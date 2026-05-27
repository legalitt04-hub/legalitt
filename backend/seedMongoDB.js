// seedMongoDB.js - Import advocates into MongoDB
// Usage: node seedMongoDB.js [--limit 100] [--city INDORE]

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
let LIMIT = null;
let CITY_FILTER = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--limit' && args[i + 1]) {
    LIMIT = parseInt(args[i + 1]);
  }
  if (args[i] === '--city' && args[i + 1]) {
    CITY_FILTER = args[i + 1].toUpperCase();
  }
}

// Import actual models from your app
const User = require('./src/models/User');
const Advocate = require('./src/models/Advocate');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Seed advocates
const seedAdvocates = async () => {
  try {
    console.log('🚀 Starting MongoDB seeding process...');
    console.log('=' .repeat(60));
    
    // Read JSON data
    const dataPath = path.join(__dirname, 'advocates_seed_data.json');
    console.log(`📖 Reading: ${dataPath}`);
    
    if (!fs.existsSync(dataPath)) {
      console.error('❌ advocates_seed_data.json not found!');
      console.log('💡 Make sure the file is in the backend folder');
      process.exit(1);
    }
    
    const advocatesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`✅ Loaded ${advocatesData.length} advocates from JSON`);
    
    // Apply filters
    let filteredData = advocatesData;
    
    if (CITY_FILTER) {
      filteredData = filteredData.filter(adv => adv.city === CITY_FILTER);
      console.log(`🔍 Filtered to city: ${CITY_FILTER} (${filteredData.length} advocates)`);
    }
    
    if (LIMIT) {
      filteredData = filteredData.slice(0, LIMIT);
      console.log(`📊 Limited to: ${LIMIT} advocates`);
    }
    
    console.log(`\n🎯 Will seed ${filteredData.length} advocates`);
    console.log('=' .repeat(60));
    
    // Clear existing data (optional - comment out to keep existing)
    const clearExisting = false;
    if (clearExisting) {
      console.log('🗑️  Clearing existing advocates...');
      await Advocate.deleteMany({});
      await User.deleteMany({ role: 'advocate' });
      console.log('✅ Cleared');
    }
    
    // Seed in batches
    const BATCH_SIZE = 100;
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    
    for (let i = 0; i < filteredData.length; i += BATCH_SIZE) {
      const batch = filteredData.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(filteredData.length / BATCH_SIZE);
      
      console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} advocates)...`);
      
      for (const advocateData of batch) {
        try {
          // Check if user already exists
          let existingUser = await User.findOne({ email: advocateData.email });
          
          if (existingUser) {
            duplicateCount++;
            continue; // Skip duplicates
          }
          
          // Create user
          const hashedPassword = await bcrypt.hash(advocateData.password, 10);
          const user = await User.create({
            name: advocateData.name,
            email: advocateData.email,
            password: hashedPassword,
            phone: advocateData.phone,
            role: 'advocate',
            isActive: true,
          });
          
          // ✅ FIXED: Properly map location with address.city
          await Advocate.create({
            user: user._id,
            barCouncilNumber: advocateData.barCouncilNumber,
            specializations: advocateData.specializations,
            experience: advocateData.experience,
            education: advocateData.education,
            about: advocateData.about,
            consultationFee: advocateData.consultationFee,
            followUpFee: advocateData.followUpFee,
            followUpDays: advocateData.followUpDays,
            location: {
              type: 'Point',
              coordinates: advocateData.location.coordinates, // [lng, lat]
              address: {
                street: advocateData.address || '',
                city: advocateData.city || 'Unknown',
                state: 'Madhya Pradesh',
                pincode: '',
              }
            },
            languages: advocateData.languages,
            availability: advocateData.availability,
            rating: advocateData.rating || { average: 0, count: 0 },
            totalConsultations: advocateData.totalConsultations || 0,
            isVerified: advocateData.isVerified !== undefined ? advocateData.isVerified : true,
            verificationStatus: advocateData.verificationStatus || 'approved',
            isOnline: advocateData.isOnline || false,
          });
          
          successCount++;
          
        } catch (error) {
          errorCount++;
          if (error.code === 11000) {
            duplicateCount++;
          } else {
            console.error(`  ⚠️ Error for ${advocateData.name}:`, error.message);
          }
        }
      }
      
      // Progress update
      const percentage = ((i + batch.length) / filteredData.length * 100).toFixed(1);
      console.log(`  ✅ Progress: ${percentage}% | Success: ${successCount} | Duplicates: ${duplicateCount} | Errors: ${errorCount}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully seeded: ${successCount} advocates`);
    console.log(`⏭️  Skipped duplicates: ${duplicateCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // Show statistics by city
    console.log('\n📊 Database Statistics by City:');
    const cityCounts = await Advocate.aggregate([
      {
        $group: {
          _id: '$location.address.city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    cityCounts.forEach(({ _id, count }) => {
      console.log(`  ${_id}: ${count} advocates`);
    });
    
    const totalInDB = await Advocate.countDocuments();
    console.log(`\n📈 Total advocates in database: ${totalInDB}`);
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await seedAdvocates();
    
    console.log('\n✅ All done! Closing connection...');
    await mongoose.connection.close();
    console.log('👋 Goodbye!\n');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

// Show usage if --help
if (args.includes('--help')) {
  console.log(`
📚 USAGE:
  
  Seed all advocates:
    node seedMongoDB.js
  
  Seed limited number:
    node seedMongoDB.js --limit 100
  
  Seed specific city:
    node seedMongoDB.js --city INDORE
  
  Combine filters:
    node seedMongoDB.js --limit 500 --city BHOPAL

📍 Available cities:
  JABALPUR, INDORE, BHOPAL, GWALIOR, REWA, UJJAIN,
  SATNA, SAGAR, CHHATARPUR, CHHINDWARA, and more...
  `);
  process.exit(0);
}

// Run
main();
