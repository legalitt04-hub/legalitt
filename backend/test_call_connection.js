const io = require("socket.io-client");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function runTest() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const User = require("./src/models/User");
  const Booking = require("./src/models/Booking");
  const Advocate = require("./src/models/Advocate");
  const CallLog = require("./src/models/CallLog");
  
  // Find a client and advocate
  const client = await User.findOne({ role: "client" });
  const advocateUser = await User.findOne({ role: "advocate" });
  const advocate = await Advocate.findOne({ user: advocateUser._id });
  
  if (!client || !advocate) {
    console.log("Need both client and advocate users to test.");
    process.exit(1);
  }

  // Create a fake booking for them
  const fakeBooking = await Booking.create({
    client: client._id,
    advocate: advocate._id,
    amount: 500,
    status: 'confirmed',
    date: new Date(),
    startTime: '10:00',
    endTime: '11:00',
    videoRoomId: 'test_zego_123',
    issue: 'Testing Socket Events',
  });
  console.log("Fake Booking Created:", fakeBooking._id);

  // Generate tokens
  const clientToken = jwt.sign({ id: client._id }, process.env.JWT_SECRET || 'secret');
  const advocateToken = jwt.sign({ id: advocateUser._id }, process.env.JWT_SECRET || 'secret');

  console.log(`Testing Call Flow: Client (${client.name}) calling Advocate (${advocateUser.name})`);

  const clientSocket = io("http://localhost:5001", { auth: { token: clientToken } });
  const advSocket = io("http://localhost:5001", { auth: { token: advocateToken } });

  let events = [];

  advSocket.on("incoming_call", (data) => {
    console.log("✅ Advocate received incoming_call");
    events.push("incoming_call");
    setTimeout(() => {
      console.log("Advocate is accepting the call...");
      advSocket.emit("call_accepted", { 
        bookingId: fakeBooking._id, 
        clientId: client._id.toString(), 
        advocateUserId: advocateUser._id.toString() 
      });
    }, 1000);
  });

  clientSocket.on("call_accepted", (data) => {
    console.log("✅ Client received call_accepted");
    events.push("call_accepted");
    
    setTimeout(() => {
      console.log("Client is ending the call after 5 seconds...");
      clientSocket.emit("call_completed", { 
        bookingId: fakeBooking._id, 
        clientId: client._id.toString(), 
        advocateUserId: advocateUser._id.toString(), 
        mode: "video", 
        duration: 5 
      });
      clientSocket.emit("call_ended", { 
        bookingId: fakeBooking._id, 
        clientId: client._id.toString(), 
        advocateUserId: advocateUser._id.toString() 
      });
    }, 2000);
  });

  advSocket.on("call_ended", async () => {
    console.log("✅ Advocate received call_ended (Call finished properly).");
    events.push("call_ended");
    
    setTimeout(async () => {
      if (events.includes("incoming_call") && events.includes("call_accepted") && events.includes("call_ended")) {
        console.log("🎉 ALL SOCKET EVENTS PASSED AND CONNECTED PERFECTLY!");
      } else {
        console.log("❌ SOME EVENTS FAILED.");
      }
      
      // Verify CallLog
      const log = await CallLog.findOne({ booking: fakeBooking._id });
      if (log && log.status === 'completed') {
        console.log("🎉 CALLLOG CREATED SUCCESSFULLY in DB!");
      } else {
        console.log("❌ CALLLOG MISSING!");
      }

      await Booking.findByIdAndDelete(fakeBooking._id);
      process.exit(0);
    }, 1000);
  });

  clientSocket.on("connect", () => {
    console.log("Client connected to socket.");
    setTimeout(() => {
      console.log("Client initiating call...");
      clientSocket.emit("initiate_call", {
        bookingId: fakeBooking._id,
        mode: "video",
      });
    }, 1000);
  });
}

runTest().catch(console.error);
