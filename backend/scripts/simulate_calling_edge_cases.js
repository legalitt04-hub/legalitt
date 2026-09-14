require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');
const User = require('../src/models/User');

const SERVER_URL = 'http://localhost:5001';

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('📦 Connected to MongoDB');
}

function createSocket(token, role) {
  return io(SERVER_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: false
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runTests() {
  await connectDB();
  
  // Find a client and an advocate
  const client = await User.findOne({ role: 'client' });
  const advocate = await User.findOne({ role: 'advocate' });

  if (!client || !advocate) {
    console.error('❌ Could not find a client and an advocate in the DB');
    process.exit(1);
  }

  // Mint tokens
  const clientToken = jwt.sign({ id: client._id.toString(), role: 'client' }, process.env.JWT_SECRET);
  
  // Create mock booking
  const Booking = require('../src/models/Booking');
  let mockBooking = await Booking.create({
    client: client._id,
    advocate: await require('../src/models/Advocate').findOne({ user: advocate._id }).then(a => a._id),
    date: new Date(),
    timeSlot: { startTime: '10:00', endTime: '11:00' },
    type: 'video', issue: 'Test Simulation Issue',
    status: 'completed',
    payment: { amount: 0, currency: 'INR', status: 'paid' }
  });
  const mB = mockBooking._id.toString();
  
  const client2Token = jwt.sign({ id: client._id.toString(), role: 'client' }, process.env.JWT_SECRET); // Simulate second client
  const advocateToken = jwt.sign({ id: advocate._id.toString(), role: 'advocate' }, process.env.JWT_SECRET);

  console.log(`👤 Client: ${client.name} (${client._id})`);
  console.log(`⚖️ Advocate: ${advocate.name} (${advocate._id})\n`);

  // Connect sockets
  const clientSocket = createSocket(clientToken, 'client');
  const client2Socket = createSocket(client2Token, 'client');
  const advSocket = createSocket(advocateToken, 'advocate');

  await new Promise(r => {
    let connected = 0;
    const check = () => { if (++connected === 3) r(); };
    clientSocket.on('connect', check);
    client2Socket.on('connect', check);
    advSocket.on('connect', check);
  });

  console.log('🔌 All sockets connected successfully.\n');

  // ── TEST 1: BUSY INTERCEPTION ──
  console.log('=== TEST 1: Busy Interception ===');
  
  const test1Promise = new Promise((resolve) => {
    // 1. Client 1 initiates call
    clientSocket.emit('initiate_call', {
      advocateUserId: advocate._id.toString(),
      bookingId: mB,
      mode: 'video'
    });

    // 2. Wait 100ms for backend to process
    setTimeout(() => {
      // 3. Client 2 tries to call the same advocate
      client2Socket.emit('initiate_call', {
        advocateUserId: advocate._id.toString(),
        bookingId: mB,
        mode: 'voice'
      });
    }, 100);

    // Assertions
    let advRinging = false;
    advSocket.once('incoming_call', () => { advRinging = true; });

    client2Socket.once('call_busy', (data) => {
      if (advRinging && data.message.includes('busy')) {
        console.log('✅ PASS: Client 2 was rejected instantly with call_busy while Advocate was ringing.');
        // Clean up test 1
        clientSocket.emit('call_ended', { bookingId: mB, advocateUserId: advocate._id.toString() });
        setTimeout(resolve, 500);
      } else {
        console.error('❌ FAIL: Did not receive expected busy state.');
      }
    });
  });

  await test1Promise;
  
  // ── TEST 2: CALLER CANCELLATION ──
  console.log('\n=== TEST 2: Caller Cancellation ===');
  const test2Promise = new Promise((resolve) => {
    advSocket.once('incoming_call', () => {
      console.log('   Advocate received incoming call...');
      // Client immediately cancels
      clientSocket.emit('call_ended', { bookingId: mB, advocateUserId: advocate._id.toString() });
    });

    advSocket.once('call_ended', () => {
      console.log('✅ PASS: Advocate received call_ended immediately after ringing started.');
      setTimeout(resolve, 500);
    });

    clientSocket.emit('initiate_call', {
      advocateUserId: advocate._id.toString(),
      bookingId: mB,
      mode: 'video'
    });
  });

  await test2Promise;

  // ── TEST 3: MISSED TIMEOUT ──
  console.log('\n=== TEST 3: Missed Timeout ===');
  const test3Promise = new Promise((resolve) => {
    advSocket.once('incoming_call', () => {
      console.log('   Advocate is ringing. Waiting for simulated timeout...');
      // Simulate timeout after 2 seconds instead of 40 for speed
      setTimeout(() => {
        clientSocket.emit('call_missed', { bookingId: mB, advocateUserId: advocate._id.toString(), mode: 'video' });
        clientSocket.emit('call_ended', { bookingId: mB, advocateUserId: advocate._id.toString() });
      }, 1000);
    });

    advSocket.once('call_missed_notify', () => {
      console.log('✅ PASS: Advocate received call_missed event properly.');
      setTimeout(resolve, 500);
    });

    clientSocket.emit('initiate_call', {
      advocateUserId: advocate._id.toString(),
      bookingId: mB,
      mode: 'video'
    });
  });

  await test3Promise;

  console.log('\n🎉 ALL EDGE CASES PASSED SUCCESSFULLY!');
  process.exit(0);
}

runTests().catch(console.error);
