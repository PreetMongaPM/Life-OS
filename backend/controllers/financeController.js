const { Expense, Income, Budget } = require('../models/Finance');

// ===== EXPENSES =====
exports.getExpenses = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const query = { userId: req.user.id };
    if (month) query.date = { $regex: `^${month}` };
    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addExpense = async (req, res) => {
  try {
    const { amount, category, note, date } = req.body;
    if (!amount || !date) return res.status(400).json({ message: 'Amount and date required.' });
    const expense = new Expense({ userId: req.user.id, amount, category, note, date });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Expense deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== INCOME =====
exports.getIncome = async (req, res) => {
  try {
    const { month } = req.query;
    const query = { userId: req.user.id };
    if (month) query.date = { $regex: `^${month}` };
    const income = await Income.find(query).sort({ date: -1 });
    res.json(income);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addIncome = async (req, res) => {
  try {
    const { amount, source, note, date } = req.body;
    if (!amount || !date) return res.status(400).json({ message: 'Amount and date required.' });
    const income = new Income({ userId: req.user.id, amount, source, note, date });
    await income.save();
    res.status(201).json(income);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteIncome = async (req, res) => {
  try {
    await Income.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Income deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== BUDGET =====
exports.getBudget = async (req, res) => {
  try {
    const { month } = req.query;
    const currentMonth = month || new Date().toISOString().substring(0, 7);
    const budget = await Budget.findOne({ userId: req.user.id, month: currentMonth });
    res.json(budget || { month: currentMonth, totalBudget: 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.setBudget = async (req, res) => {
  try {
    const { month, totalBudget, categoryBudgets } = req.body;
    const currentMonth = month || new Date().toISOString().substring(0, 7);
    let budget = await Budget.findOne({ userId: req.user.id, month: currentMonth });
    if (budget) {
      Object.assign(budget, { totalBudget, categoryBudgets, updatedAt: Date.now() });
      await budget.save();
    } else {
      budget = new Budget({ userId: req.user.id, month: currentMonth, totalBudget, categoryBudgets });
      await budget.save();
    }
    res.json(budget);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== MONTHLY SUMMARY =====
exports.getMonthlySummary = async (req, res) => {
  try {
    const { month } = req.query;
    const currentMonth = month || new Date().toISOString().substring(0, 7);
    const expenses = await Expense.find({ userId: req.user.id, date: { $regex: `^${currentMonth}` } });
    const income = await Income.find({ userId: req.user.id, date: { $regex: `^${currentMonth}` } });
    const budget = await Budget.findOne({ userId: req.user.id, month: currentMonth });

    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = income.reduce((s, i) => s + i.amount, 0);

    const categoryBreakdown = {};
    expenses.forEach(e => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });

    // Last 6 months bar chart data
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.toISOString().substring(0, 7);
      const mExpenses = await Expense.find({ userId: req.user.id, date: { $regex: `^${m}` } });
      monthlyData.push({ month: m, total: mExpenses.reduce((s, e) => s + e.amount, 0) });
    }

    res.json({
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      categoryBreakdown,
      budget: budget || { totalBudget: 0 },
      monthlyTrend: monthlyData
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
