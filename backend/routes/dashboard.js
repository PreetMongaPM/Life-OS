const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Assignment } = require('../models/Academics');
const HealthLog = require('../models/HealthLog');
const { Expense } = require('../models/Finance');
const { StudyPlan } = require('../models/Academics');

// @route   GET /api/dashboard
router.get('/', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Upcoming assignments (next 7 days, pending)
    const upcomingAssignments = await Assignment.find({
      userId: req.user.id,
      status: 'pending',
      dueDate: { $gte: new Date(), $lte: nextWeek }
    }).sort({ dueDate: 1 }).limit(5);

    // Today's health
    const healthToday = await HealthLog.findOne({ userId: req.user.id, date: today }) ||
      { waterGlasses: 0, sleepHours: 0, steps: 0, workoutType: 'None' };

    // Today's expenses
    const todayExpenses = await Expense.find({ userId: req.user.id, date: today });
    const totalExpensesToday = todayExpenses.reduce((s, e) => s + e.amount, 0);

    // Today's study hours
    const todayPlans = await StudyPlan.find({ userId: req.user.id, date: today, completed: true });
    const studyHoursToday = todayPlans.reduce((s, p) => s + (p.duration || 0), 0);

    // Stats
    const totalPending = await Assignment.countDocuments({ userId: req.user.id, status: 'pending' });
    const totalCompleted = await Assignment.countDocuments({ userId: req.user.id, status: 'completed' });

    res.json({
      upcomingAssignments,
      healthToday,
      totalExpensesToday,
      studyHoursToday,
      stats: { totalPending, totalCompleted }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
