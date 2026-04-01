const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'inactive'
  },
  subscriptionPlan: {
    type: String,
    enum: ['monthly', 'yearly', null],
    default: null
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  charityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity',
    default: null
  },
  charityPercent: {
    type: Number,
    default: 10,
    min: 10,
    max: 100
  }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);