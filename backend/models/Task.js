const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['To Do', 'In Progress', 'Completed'], default: 'To Do' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  due: { type: String, default: 'Today' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
