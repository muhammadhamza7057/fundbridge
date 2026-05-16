const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
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
    stage: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deal', dealSchema);