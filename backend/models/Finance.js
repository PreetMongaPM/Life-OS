const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    enum: ['food', 'transport', 'books', 'entertainment', 'miscellaneous', 'health', 'clothing'],
    default: 'miscellaneous'
  },
  note: { type: String, default: '' },
  date: { type: String, required: true }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
});

const incomeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  source: { type: String, required: true },
  note: { type: String, default: '' },
  date: { type: String, required: true }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
});

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // YYYY-MM
  totalBudget: { type: Number, required: true },
  categoryBudgets: {
    food: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    books: { type: Number, default: 0 },
    entertainment: { type: Number, default: 0 },
    miscellaneous: { type: Number, default: 0 },
    health: { type: Number, default: 0 },
    clothing: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = {
  Expense: mongoose.model('Expense', expenseSchema),
  Income: mongoose.model('Income', incomeSchema),
  Budget: mongoose.model('Budget', budgetSchema)
};
