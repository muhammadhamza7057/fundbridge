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
    title: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    documents: [
      {
        url: { type: String },
        filename: { type: String },
        mimetype: { type: String },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stage: {
      type: String,
      required: true,
      trim: true,
      enum: ['Interested', 'Pitch Shared', 'Negotiation', 'Funded'],
      default: 'Interested',
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