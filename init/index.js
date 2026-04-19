const mongoose = require('mongoose');
const initData = require('./data');
const Listing = require('../models/listing');
const MONGO_URL = 'mongodb://127.0.0.1:27017/Mangoo';

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: '69cc231764b4f9e6939026be',
  }));
  await Listing.insertMany(initData.data);
  console.log('data was initialized');
};

async function main() {
  await mongoose.connect(MONGO_URL);
  await initDB();
}

main()
  .then(() => {
    console.log('connected to db');
  })
  .catch((err) => {
    console.log(err);
  });
