const HealthLog = require('../models/HealthLog');

// @route   POST /api/health/log
exports.logHealth = async (req, res) => {
  try {
    const { date, waterGlasses, sleepHours, workoutType, workoutDuration, steps, mood } = req.body;
    if (!date) return res.status(400).json({ message: 'Date required.' });

    let log = await HealthLog.findOne({ userId: req.user.id, date });
    if (log) {
      // Update existing log
      Object.assign(log, { waterGlasses, sleepHours, workoutType, workoutDuration, steps, mood, updatedAt: Date.now() });
      await log.save();
    } else {
      log = new HealthLog({ userId: req.user.id, date, waterGlasses, sleepHours, workoutType, workoutDuration, steps, mood });
      await log.save();
    }
    res.json(log);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @route   GET /api/health/log
exports.getLogs = async (req, res) => {
  try {
    const logs = await HealthLog.find({ userId: req.user.id }).sort({ date: -1 }).limit(30);
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @route   GET /api/health/today
exports.getToday = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const log = await HealthLog.findOne({ userId: req.user.id, date: today });
    res.json(log || { date: today, waterGlasses: 0, sleepHours: 0, workoutType: 'None', steps: 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @route   GET /api/health/weekly
exports.getWeeklyStats = async (req, res) => {
  try {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    const logs = await HealthLog.find({ userId: req.user.id, date: { $in: days } });
    const logsMap = {};
    logs.forEach(l => logsMap[l.date] = l);
    const weekly = days.map(d => logsMap[d] || { date: d, waterGlasses: 0, sleepHours: 0, steps: 0, workoutType: 'None' });
    const avgSleep = (weekly.reduce((s, l) => s + (l.sleepHours || 0), 0) / 7).toFixed(1);
    const avgWater = (weekly.reduce((s, l) => s + (l.waterGlasses || 0), 0) / 7).toFixed(1);
    const workoutDays = weekly.filter(l => l.workoutType && l.workoutType !== 'None').length;
    res.json({ weekly, avgSleep, avgWater, workoutDays, labels: days });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
