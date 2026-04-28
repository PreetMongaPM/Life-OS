const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/financeController');
const auth = require('../middleware/auth');

// Expenses
router.get('/expenses', auth, ctrl.getExpenses);
router.post('/expenses', auth, ctrl.addExpense);
router.delete('/expenses/:id', auth, ctrl.deleteExpense);

// Income
router.get('/income', auth, ctrl.getIncome);
router.post('/income', auth, ctrl.addIncome);
router.delete('/income/:id', auth, ctrl.deleteIncome);

// Budget
router.get('/budget', auth, ctrl.getBudget);
router.post('/budget', auth, ctrl.setBudget);

// Monthly Summary
router.get('/summary', auth, ctrl.getMonthlySummary);

module.exports = router;
