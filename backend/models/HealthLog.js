const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  waterGlasses: { type: Number, default: 0, min: 0, max: 20 },
  sleepHours: { type: Number, default: 0, min: 0, max: 24 },
  workoutType: { type: String, default: 'None' },
  workoutDuration: { type: Number, default: 0 }, // minutes
  steps: { type: Number, default: 0 },
  mood: { type: String, enum: ['great', 'good', 'okay', 'bad', 'terrible'], default: 'good' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthLog', healthLogSchema);
