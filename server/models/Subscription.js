const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'active'
  },
  amount: {
    type: Number,
    required: true
  },
  renewalDate: {
    type: Date,
    required: true
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: 'mock_sub_' + Date.now()
  }
}, { timestamps: true });

module.exports = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);