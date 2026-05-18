const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { connectMongo } = require('../utils/mongoConnection');

dotenv.config();

const User = require('../models/User');
const Startup = require('../models/Startup');
const Investor = require('../models/Investor');
const Match = require('../models/Match');
const Chat = require('../models/Chat');
const Deal = require('../models/Deal');

async function initCollections() {
  await connectMongo(mongoose, { label: 'MongoDB', retryCount: 3, retryDelayMs: 1000 });

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