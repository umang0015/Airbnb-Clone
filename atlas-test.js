require('dotenv').config();
const mongoose = require('mongoose');
const dbUrl = process.env.ATLASDB_URL;

console.log('Testing Atlas connect...');
mongoose.connect(dbUrl, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  bufferCommands: false
})
.then(() => {
  console.log('✅ DB connected successfully!');
  mongoose.connection.close();
})
.catch(err => {
  console.error('❌ DB connect failed:', err.message);
  console.error('Try: Atlas whitelist IP, check network/VPN, verify cluster/users.');
});
