const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function migrate() {
  const mongoUri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').replace(/\/(fundbridge)(?=\?|$)/i, '/FundBridge');
  if (!mongoUri) {
    throw new Error('MONGO_URI or MONGODB_URI is not defined in the environment');
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

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
