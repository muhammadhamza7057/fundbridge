const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: true,
    },
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investor',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);