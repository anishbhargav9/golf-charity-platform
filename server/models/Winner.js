const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  drawId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Draw',
    required: true
  },
  matchType: {
    type: String,
    enum: ['3', '4', '5'],
    required: true
  },
  prizeAmount: {
    type: Number,
    default: 0
  },
  proofUrl: {
    type: String,
    default: null
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Winner', winnerSchema);