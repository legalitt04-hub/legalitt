const mongoose = require('mongoose');
const uri = "mongodb+srv://legalitt_admin:iIbMGpbZSMkFf16G@legalitt-prod.sjiugqg.mongodb.net/legalitt?retryWrites=true&w=majority";
const Booking = require('./src/models/Booking');
const Case = require('./src/models/Case');

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to DB for updating location');
    
    // Update the booking we created
    const bookingResult = await Booking.updateMany(
      { issue: /tenant who refuses to vacate/ },
      { $set: { clientCity: 'Indore' } }
    );
    console.log(`Updated ${bookingResult.modifiedCount} bookings to Indore.`);

    // Update the case we created
    const caseResult = await Case.updateMany(
      { title: /Verma Family/ },
      { $set: { courtName: 'High Court of Indore' } }
    );
    console.log(`Updated ${caseResult.modifiedCount} cases to Indore.`);

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
