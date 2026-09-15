const { io } = require("socket.io-client");
const axios = require("axios");

async function run() {
  try {
    // 1. Log in as client
    console.log("Logging in...");
    const loginRes = await axios.post("https://legalitt-growth.onrender.com/api/v1/auth/login", {
      email: "testclient@legalitt.com",
      password: "Client@123"
    });
    
    const clientToken = loginRes.data.data.accessToken;
    
    // 2. Connect socket
    console.log("Connecting socket...");
    const socket = io("https://legalitt-growth.onrender.com", {
      auth: { token: clientToken },
      transports: ["websocket"]
    });
    
    socket.on("connect", () => {
      console.log("Socket connected! ID:", socket.id);
      
      // 3. Emit initiate_call
      // For this to work without crashing, we need a valid booking ID or chat ID.
      // We will try with a fake chat ID. The server might just reject it.
      // But let's check if the server crashes.
      console.log("Emitting initiate_call...");
      socket.emit("initiate_call", {
        chatId: "64abcd1234567890abcd1234", // Fake ObjectId
        mode: "video"
      });
      
      setTimeout(() => {
        console.log("No crash observed after 5s.");
        socket.disconnect();
        process.exit(0);
      }, 5000);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
      process.exit(1);
    });
    
    socket.on("disconnect", () => {
      console.log("Socket disconnected by server!");
    });
    
  } catch (err) {
    console.error("Test failed:", err?.response?.data || err.message);
  }
}
run();
