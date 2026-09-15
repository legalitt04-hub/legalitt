const { io } = require("socket.io-client");
const mongoose = require("mongoose");
const User = require("./src/models/User");
const { Chat } = require("./src/models/Chat");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: '/Users/krishsoni/Downloads/legalitt 2/backend/.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const client = await User.findOne({ email: "testclient@legalitt.com" });
    const adv = await User.findOne({ email: "test.adv.fixed2026@legalitt.com" });

    const clientToken = jwt.sign({ id: client._id, role: client.role }, process.env.JWT_SECRET);
    const advToken = jwt.sign({ id: adv._id, role: adv.role }, process.env.JWT_SECRET);

    let chat = await Chat.findOne({ participants: { $all: [client._id, adv._id] } });
    if (!chat) chat = await Chat.create({ participants: [client._id, adv._id] });

    console.log("Chat ID:", chat._id.toString());

    const clientSocket = io("https://legalitt-growth.onrender.com", { auth: { token: clientToken }, transports: ["websocket"] });
    const advSocket = io("https://legalitt-growth.onrender.com", { auth: { token: advToken }, transports: ["websocket"] });

    advSocket.on("connect", () => {
      console.log("Advocate socket connected:", advSocket.id);
    });

    advSocket.on("incoming_call", (data) => {
      console.log("✅ SUCCESS! Advocate received incoming_call:", data);
      clientSocket.disconnect();
      advSocket.disconnect();
      process.exit(0);
    });

    clientSocket.on("connect", () => {
      console.log("Client socket connected:", clientSocket.id);
      setTimeout(() => {
        console.log("5. Emitting initiate_call from Client...");
        clientSocket.emit("initiate_call", {
          chatId: chat._id.toString(),
          mode: "video"
        });
      }, 1000);
    });

    setTimeout(() => {
      console.log("❌ FAILED: Timeout waiting for incoming_call");
      clientSocket.disconnect();
      advSocket.disconnect();
      process.exit(1);
    }, 10000);

  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}
run();
