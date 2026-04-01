const mongoose = require('mongoose');

const scoreEntrySchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 45
  },
  date: {
    type: Date,
    required: true
  }
});

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  scores: {
    type: [scoreEntrySchema],
    validate: {
      validator: function(arr) { return arr.length <= 5; },
      message: 'Maximum 5 scores allowed'
    },
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.models.Score || mongoose.model('Score', scoreSchema);