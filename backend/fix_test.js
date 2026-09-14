const fs = require('fs');
let content = fs.readFileSync('scripts/simulate_calling_edge_cases.js', 'utf8');

// replace mock-booking logic
content = content.replace("const client2Token", `
  // Create mock booking
  const Booking = require('../src/models/Booking');
  let mockBooking = await Booking.create({
    client: client._id,
    advocate: await require('../src/models/Advocate').findOne({ user: advocate._id }).then(a => a._id),
    date: new Date(),
    timeSlot: { startTime: '10:00', endTime: '11:00' },
    type: 'video',
    status: 'completed',
    payment: { amount: 0, currency: 'INR', status: 'paid' }
  });
  const mB = mockBooking._id.toString();
  
  const client2Token`);

content = content.replace(/'mock-booking-[0-9]+'/g, 'mB');

fs.writeFileSync('scripts/simulate_calling_edge_cases.js', content);
