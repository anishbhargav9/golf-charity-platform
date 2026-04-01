const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  eventDate:   { type: Date }
});

const charitySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, required: true },
  images:      [{ type: String }],
  events:      [eventSchema],
  featured:    { type: Boolean, default: false },
  website:     { type: String, default: '' },
  totalRaised: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Charity || mongoose.model('Charity', charitySchema);