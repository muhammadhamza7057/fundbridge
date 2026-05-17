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
      enum: ['founder', 'investor', 'startup_rep', 'guest', 'admin'],
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
    profileCompleteness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    activityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    reviewScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    adminApproved: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      default: '',
    },
    emailVerificationExpiresAt: {
      type: Date,
      default: null,
    },
    phoneVerificationCode: {
      type: String,
      default: '',
    },
    phoneVerificationExpiresAt: {
      type: Date,
      default: null,
    },
    lastTrustUpdatedAt: {
      type: Date,
      default: null,
    },
    lastAdminEmailTemplate: {
      type: String,
      default: '',
    },
    lastAdminEmailReason: {
      type: String,
      default: '',
    },
    lastAdminEmailSubject: {
      type: String,
      default: '',
    },
    lastAdminEmailMessage: {
      type: String,
      default: '',
    },
    lastAdminEmailAt: {
      type: Date,
      default: null,
    },
    adminRelationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    adminRelationNote: {
      type: String,
      default: '',
    },
    relatedAdminId: {
      type: String,
      default: '',
    },
    relatedAdminEmail: {
      type: String,
      default: '',
    },
    lastVerifiedByAdminAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);