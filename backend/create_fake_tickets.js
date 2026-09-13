const mongoose = require('mongoose');
require('dotenv').config();

const SupportTicket = require('./src/models/SupportTicket');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to DB');

    // Find a client
    const client = await User.findOne({ role: 'client' });
    // Find an advocate
    const advocate = await User.findOne({ role: 'advocate' });

    if (!client || !advocate) {
      console.log('Missing client or advocate in DB');
      process.exit(1);
    }

    const tkt1 = new SupportTicket({
      user: client._id,
      subject: 'Payment deducted but booking pending',
      description: 'Hi, I paid for a consultation just now but the app still says my booking is pending. Please check.',
      category: 'payment',
      priority: 'high',
      status: 'open'
    });

    const tkt2 = new SupportTicket({
      user: advocate._id,
      subject: 'My verification documents are rejected',
      description: 'I uploaded my Bar Council certificate but it got rejected without any clear reason. Please help me fix it.',
      category: 'account',
      priority: 'medium',
      status: 'in-progress'
    });

    await tkt1.save();
    await tkt2.save();

    console.log('Fake tickets created successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
