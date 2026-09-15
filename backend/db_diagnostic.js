const mongoose = require('mongoose');
require('dotenv').config();

async function runDiagnostics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');
    
    const admin = mongoose.connection.db.admin();
    
    // Check server status
    const serverStatus = await admin.serverStatus();
    console.log('\n--- Server Status ---');
    console.log('Version:', serverStatus.version);
    console.log('Uptime:', serverStatus.uptime);
    console.log('Connections:', serverStatus.connections);
    console.log('OpCounters:', serverStatus.opcounters);
    console.log('Mem:', serverStatus.mem);
    
    // Check current operations
    const currentOps = await admin.command({ currentOp: 1 });
    console.log('\n--- Slow/Active Operations ---');
    const slowOps = currentOps.inprog.filter(op => op.secs_running > 2 || op.waitingForLock);
    console.log(`Found ${slowOps.length} slow/blocked ops.`);
    slowOps.forEach(op => console.log(op));

    // Get DB Stats
    const dbStats = await mongoose.connection.db.stats();
    console.log('\n--- DB Stats ---');
    console.log(dbStats);

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
runDiagnostics();
