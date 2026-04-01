const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
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
  poolAmount:   { type: Number, default: 0 },
  winnersCount: { type: Number, default: 0 },
  splitAmount:  { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Prize || mongoose.model('Prize', prizeSchema);