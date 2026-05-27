#!/bin/bash
# seed_all_cities.sh - Seed 2000 advocates per city

echo "🌍 Starting multi-city seeding process..."
echo "Target: 2000 advocates per city"
echo "========================================"

# List of major cities in Madhya Pradesh
cities=(
  "INDORE"
  "BHOPAL"
  "JABALPUR"
  "GWALIOR"
  "UJJAIN"
  "SAGAR"
  "REWA"
  "SATNA"
  "DEWAS"
  "KATNI"
  "CHHINDWARA"
  "BURHANPUR"
  "RATLAM"
  "SINGRAULI"
  "CHHATARPUR"
  "KHANDWA"
  "MORENA"
  "VIDISHA"
  "DAMOH"
  "MANDSAUR"
)

total_cities=${#cities[@]}
current=0

for city in "${cities[@]}"
do
  current=$((current + 1))
  echo ""
  echo "📍 [$current/$total_cities] Seeding $city (2000 advocates)..."
  echo "----------------------------------------"
  
  node seedMongoDB.js --city "$city" --limit 2000
  
  if [ $? -eq 0 ]; then
    echo "✅ $city completed successfully"
  else
    echo "❌ $city failed"
  fi
  
  # Small delay between cities
  sleep 2
done

echo ""
echo "========================================"
echo "🎉 All cities seeded!"
echo ""
echo "📊 Getting final statistics..."

node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const Advocate = require('./src/models/Advocate');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const cities = await Advocate.aggregate([
    { \$match: { isVerified: true } },
    { \$group: { _id: '\$location.address.city', count: { \$sum: 1 } } },
    { \$sort: { count: -1 } }
  ]);
  
  console.log('\n📊 Final Database Statistics:');
  console.log('=====================================');
  cities.forEach(c => {
    console.log(\`  \${c._id}: \${c.count} advocates\`);
  });
  
  const total = await Advocate.countDocuments();
  console.log(\`\n📈 Total Advocates: \${total}\`);
  console.log('=====================================\n');
  
  process.exit(0);
});
"

echo "✨ Done!"
