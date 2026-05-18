const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const { connectMongo } = require('../utils/mongoConnection');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

async function seedAdmin() {
  await connectMongo(mongoose, { label: 'MongoDB', retryCount: 3, retryDelayMs: 1000 });

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
