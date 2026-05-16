const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const User = require('../models/User');
const Startup = require('../models/Startup');
const Investor = require('../models/Investor');
const Match = require('../models/Match');
const Chat = require('../models/Chat');
const Deal = require('../models/Deal');

const mongoUri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').replace(/\/(fundbridge)(?=\?|$)/i, '/FundBridge');

async function initCollections() {
  if (!mongoUri) {
    throw new Error('MONGO_URI or MONGODB_URI is not defined in the environment');
  }

  await mongoose.connect(mongoUri);

  await Promise.all([
    User.createCollection(),
    Startup.createCollection(),
    Investor.createCollection(),
    Match.createCollection(),
    Chat.createCollection(),
    Deal.createCollection(),
  ]);

  console.log('Atlas collections created or already present:');
  console.log('- users');
  console.log('- startups');
  console.log('- investors');
  console.log('- matches');
  console.log('- chats');
  console.log('- deals');

  await mongoose.disconnect();
}

initCollections().catch(async (error) => {
  console.error('Failed to initialize collections:', error.message);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('Disconnect error:', disconnectError.message);
  }
  process.exit(1);
});