const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  target: { type: String, default: 'Daily' },
  color: { type: String, default: 'bg-indigo-500' },
  streak: { type: Number, default: 0 },
  completedDates: [{ type: String }] // Array of date strings 'YYYY-MM-DD'
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
