const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const { connectMongo } = require('../utils/mongoConnection');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function migrate() {
  await connectMongo(mongoose, { label: 'MongoDB', retryCount: 3, retryDelayMs: 1000 });

  const result = await User.updateMany(
    { firebaseUid: '' },
    { $unset: { firebaseUid: '' } }
  );

  console.log(`Updated ${result.modifiedCount || 0} users: cleared empty firebaseUid values.`);
  await mongoose.disconnect();
}

migrate().catch(async (error) => {
  console.error('Firebase UID migration failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
