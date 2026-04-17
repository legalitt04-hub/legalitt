require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/database');
const { initSocket } = require('./config/socket');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const start = async () => {
  // Connect MongoDB
  await connectDB();

  const server = http.createServer(app);

  // Init Socket.io (async — connects Redis adapter if REDIS_URL is set)
  await initSocket(server);

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });

  // Graceful shutdown — critical for zero-downtime deploys on AWS/Render
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    // Force exit after 10s if connections don't close
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection:', err.message);
    shutdown('unhandledRejection');
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err.message);
    process.exit(1);
  });
};

start();
