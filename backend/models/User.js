const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['founder', 'investor', 'startup_rep', 'guest'],
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
    },
    authProvider: {
      type: String,
      enum: ['local', 'firebase'],
      default: 'local',
    },
    firebaseUid: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: undefined,
    },
    trustScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);