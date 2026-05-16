const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Startup = require('../models/Startup');
const Investor = require('../models/Investor');
const Match = require('../models/Match');
const Chat = require('../models/Chat');
const Deal = require('../models/Deal');

const mongoUri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').replace(/\/(fundbridge)(?=\?|$)/i, '/FundBridge');

async function seedTestData() {
  if (!mongoUri) {
    throw new Error('MONGO_URI or MONGODB_URI is not defined in the environment');
  }

  await mongoose.connect(mongoUri);

  const founderEmail = 'founder@test.com';
  const investorEmail = 'investor@test.com';
  const hashedPassword = await bcrypt.hash('Pass1234!', 10);

  const founderUser = await User.findOneAndUpdate(
    { email: founderEmail },
    {
      $set: {
        name: 'Test Founder',
        email: founderEmail,
        password: hashedPassword,
        role: 'founder',
        trustScore: 82,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  const investorUser = await User.findOneAndUpdate(
    { email: investorEmail },
    {
      $set: {
        name: 'Test Investor',
        email: investorEmail,
        password: hashedPassword,
        role: 'investor',
        trustScore: 88,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  const startup = await Startup.findOneAndUpdate(
    { userId: founderUser._id },
    {
      $set: {
        userId: founderUser._id,
        name: 'FundBridge AI',
        industry: 'FinTech',
        stage: 'Seed',
        fundingNeeded: 250000,
        description: 'AI-driven platform for matching founders with investors.',
        pitchDeck: 'https://example.com/pitchdeck.pdf',
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  const investorProfile = await Investor.findOneAndUpdate(
    { userId: investorUser._id },
    {
      $set: {
        userId: investorUser._id,
        investmentRange: { min: 50000, max: 500000 },
        industries: ['FinTech', 'AI', 'SaaS'],
        riskLevel: 'medium',
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  await Match.findOneAndUpdate(
    { startupId: startup._id, investorId: investorProfile._id },
    {
      $set: {
        startupId: startup._id,
        investorId: investorProfile._id,
        score: 91,
        status: 'shortlisted',
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  const existingChat = await Chat.findOne({
    participants: { $all: [founderUser._id, investorUser._id] },
  });

  if (existingChat) {
    existingChat.participants = [founderUser._id, investorUser._id];
    existingChat.messages = [
      {
        sender: founderUser._id,
        content: 'Thanks for reviewing our startup.',
      },
      {
        sender: investorUser._id,
        content: 'Happy to connect. Let\'s discuss the next steps.',
      },
    ];
    await existingChat.save();
  } else {
    await Chat.create({
      participants: [founderUser._id, investorUser._id],
      messages: [
        {
          sender: founderUser._id,
          content: 'Thanks for reviewing our startup.',
        },
        {
          sender: investorUser._id,
          content: 'Happy to connect. Let\'s discuss the next steps.',
        },
      ],
    });
  }

  await Deal.findOneAndUpdate(
    { startupId: startup._id, investorId: investorProfile._id },
    {
      $set: {
        startupId: startup._id,
        investorId: investorProfile._id,
        stage: 'term-sheet',
        amount: 150000,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  console.log('Test data seeded successfully.');
  console.log(`Founder user: ${founderEmail}`);
  console.log(`Investor user: ${investorEmail}`);

  await mongoose.disconnect();
}

seedTestData().catch(async (error) => {
  console.error('Failed to seed test data:', error.message);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('Disconnect error:', disconnectError.message);
  }
  process.exit(1);
});