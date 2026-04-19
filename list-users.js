const mongoose = require('mongoose');
const User = require('./models/user');
const MONGO_URL = 'mongodb://127.0.0.1:27017/Mangoo';

async function main() {
  await mongoose.connect(MONGO_URL);
  const users = await User.find({}, 'username email');
  console.log('Users:');
  users.forEach(user => {
    console.log(`- ${user.username} (${user.email})`);
  });
  mongoose.connection.close();
}

main().catch(err => console.log(err));
