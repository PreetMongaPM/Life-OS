const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  date: { type: String, required: true }, // e.g. ISO string or 'YYYY-MM-DD'
  color: { type: String, default: 'bg-brand-primary' },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
