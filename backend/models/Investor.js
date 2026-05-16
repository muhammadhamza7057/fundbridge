const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    investmentRange: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },
      max: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    industries: [{
      type: String,
      trim: true,
    }],
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Investor', investorSchema);