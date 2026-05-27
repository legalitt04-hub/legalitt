require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/database');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('Full error:', err);
  process.exit(1);
});

const start = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    await initSocket(server);
    
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Startup error:');
    console.error(error);
    process.exit(1);
  }
};

start();
