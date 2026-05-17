const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const mongoUri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').replace(/\/(fundbridge)(?=\?|$)/i, '/FundBridge');

async function seedAdmin() {
  if (!mongoUri) {
    throw new Error('MONGO_URI or MONGODB_URI is not defined in the environment');
  }

  await mongoose.connect(mongoUri);

  const adminEmail = 'hamza@gmail.com';
  const adminPassword = 'Hamza123';

  const hashed = await bcrypt.hash(adminPassword, 10);

  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        name: 'Admin Hamza',
        email: adminEmail,
        password: hashed,
        role: 'admin',
        adminApproved: true,
        emailVerified: true,
        phoneVerified: true,
        trustScore: 100,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  console.log('Admin user created/updated:');
  console.log(`  email: ${admin.email}`);
  console.log('  password: (the one you provided)');

  await mongoose.disconnect();
}

seedAdmin().catch(async (error) => {
  console.error('Failed to seed admin:', error.message);
  try {
    await mongoose.disconnect();
  } catch (e) {}
  process.exit(1);
});
