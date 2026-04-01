const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema({
  month: { type: Number, required: true },
  year:  { type: Number, required: true },
  drawnNumbers: {
    type: [Number],
    default: []
  },
  algorithmType: {
    type: String,
    enum: ['random', 'algorithmic'],
    default: 'random'
  },
  status: {
    type: String,
    enum: ['draft', 'simulated', 'published'],
    default: 'draft'
  },
  prizePool: {
    type: Number,
    default: 0
  },
  jackpotRollover: {
    type: Boolean,
    default: false
  },
  jackpotCarriedAmount: {
    type: Number,
    default: 0
  },
  totalSubscribers: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.models.Draw || mongoose.model('Draw', drawSchema);