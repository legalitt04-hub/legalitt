const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/legalitt');

const advocateSchema = new mongoose.Schema({}, { strict: false });
const Advocate = mongoose.model('Advocate', advocateSchema);

async function check() {
  try {
    const total = await Advocate.countDocuments({"location.coordinates": {$exists: true}});
    console.log(`Total advocates with coordinates: ${total}`);
    
    const verified = await Advocate.countDocuments({
      isVerified: true,
      verificationStatus: "approved",
      "location.coordinates": {$exists: true}
    });
    console.log(`Verified advocates with coordinates: ${verified}`);
    
    const samples = await Advocate.find(
      {"location.coordinates": {$exists: true}},
      {name: 1, "location.coordinates": 1, isVerified: 1, verificationStatus: 1}
    ).limit(5).lean();
    
    console.log("\nSample advocates:");
    samples.forEach(adv => {
      console.log(`- ${adv.name || 'No name'}: coords=${JSON.stringify(adv.location.coordinates)}, verified=${adv.isVerified}, status=${adv.verificationStatus}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

check();
