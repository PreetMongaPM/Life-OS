const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

function calculateStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;
  
  // Sort descending
  const dates = [...new Set(completedDates)].sort((a, b) => new Date(b) - new Date(a));
  
  // Use local timezone to match frontend 'en-CA' dates
  const today = new Date();
  const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = new Date(yesterday.getTime() - (yesterday.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  let streak = 0;
  let checkDate = new Date(today);

  if (dates.includes(todayStr)) {
    // Start streak from today
  } else if (dates.includes(yesterdayStr)) {
    // Start streak from yesterday
    checkDate = yesterday;
  } else {
    // Neither today nor yesterday completed -> streak broken
    return 0;
  }

  while (true) {
    const dateStr = new Date(checkDate.getTime() - (checkDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    if (dates.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    // Dynamically update and correct streaks if days passed
    const updatedHabits = await Promise.all(habits.map(async (habit) => {
      const realStreak = calculateStreak(habit.completedDates);
      if (habit.streak !== realStreak) {
        habit.streak = realStreak;
        await habit.save();
      }
      return habit;
    }));

    res.json(updatedHabits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const habit = new Habit({ ...req.body, user: req.user.id });
  try {
    const newHabit = await habit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json(habit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle completion for a specific date
router.post('/:id/toggle', auth, async (req, res) => {
  try {
    const { date } = req.body; // e.g. '2026-10-24'
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Not found' });

    const dateIndex = habit.completedDates.indexOf(date);
    if (dateIndex > -1) {
      habit.completedDates.splice(dateIndex, 1);
    } else {
      habit.completedDates.push(date);
    }
    
    habit.streak = calculateStreak(habit.completedDates);
    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
