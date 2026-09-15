const { io } = require("socket.io-client");
const axios = require("axios");

async function run() {
  try {
    console.log("1. Logging in as Client...");
    const clientRes = await axios.post("https://legalitt-growth.onrender.com/api/v1/auth/login", {
      email: "testclient@legalitt.com",
      password: "Client@123"
    });
    const clientToken = clientRes.data.data.accessToken;

    console.log("2. Logging in as Advocate...");
    const advRes = await axios.post("https://legalitt-growth.onrender.com/api/v1/auth/login", {
      email: "test.adv.fixed2026@legalitt.com",
      password: "Advocate@123"
    });
    const advToken = advRes.data.data.accessToken;
    const advUserId = advRes.data.data.user._id;

    // We need a chat between them to test
    console.log("3. Creating/fetching chat between them...");
    const chatRes = await axios.post(
      "https://legalitt-growth.onrender.com/api/v1/chat",
      { participantId: advUserId },
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    const chatId = chatRes.data.data._id;
    console.log("Chat ID:", chatId);

    console.log("4. Connecting Sockets...");
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
    
    advSocket.on("call_busy", (data) => {
      console.log("⚠️ Call busy:", data);
    });

    advSocket.on("error", (err) => {
      console.error("Advocate Socket Error:", err);
    });

    clientSocket.on("connect", () => {
      console.log("Client socket connected:", clientSocket.id);
      console.log("5. Emitting initiate_call from Client...");
      setTimeout(() => {
        clientSocket.emit("initiate_call", {
          chatId: chatId,
          mode: "video"
        });
      }, 1000);
    });

    setTimeout(() => {
      console.log("❌ FAILED: Timeout waiting for incoming_call");
      clientSocket.disconnect();
      advSocket.disconnect();
      process.exit(1);
    }, 8000);

  } catch (err) {
    console.error("Script failed:", err?.response?.data || err.message);
    process.exit(1);
  }
}
run();
