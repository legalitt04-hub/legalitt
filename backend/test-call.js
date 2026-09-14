const { io } = require("socket.io-client");

const CLIENT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMGJjNWE3MzA5OTk1YWI2NGY2NTdkYSIsImlhdCI6MTc4OTI5NDIzNiwiZXhwIjoxNzg5MzgwNjM2fQ.aiins3DFo8QP_2sfLT74i3PTgqe5rQ07PImYx5vBgO8";
const ADVOCATE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhN2RmNjYxMzBiM2QzYmNmNzc2MDNhOSIsImlhdCI6MTc4OTI5NDIzNiwiZXhwIjoxNzg5MzgwNjM2fQ.x3s7f42dTPvDzkSQYVJS4WEzVoHiELXN9jCn1yEcZ2c";
const BOOKING_ID = "6a0bd8d5e806c43e345c9a07";

const clientSocket = io("http://localhost:5001", { auth: { token: CLIENT_TOKEN } });
const advocateSocket = io("http://localhost:5001", { auth: { token: ADVOCATE_TOKEN } });

advocateSocket.on("connect", () => {
  console.log("Advocate Socket Connected: " + advocateSocket.id);
  
  advocateSocket.on("incoming_call", (data) => {
    console.log("\n=================================");
    console.log("✅ SUCCESS: ADVOCATE RECEIVED INCOMING CALL!");
    console.log("Payload:", data);
    console.log("=================================\n");
    
    // Now advocate accepts the call
    console.log("Advocate sending accept_call...");
    advocateSocket.emit("accept_call", { bookingId: BOOKING_ID });
  });
});

clientSocket.on("connect", () => {
  console.log("Client Socket Connected: " + clientSocket.id);
  
  // Wait a second for advocate to connect, then call
  setTimeout(() => {
    console.log("Client initiating call to Advocate...");
    clientSocket.emit("initiate_call", {
      bookingId: BOOKING_ID,
      zegoRoomId: `legalitt-${BOOKING_ID}`,
      mode: "video"
    });
  }, 1000);
});

// Timeout script after 4 seconds
setTimeout(() => {
  console.log("Test finished.");
  process.exit(0);
}, 4000);
