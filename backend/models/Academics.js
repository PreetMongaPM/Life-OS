const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#6c63ff' },
  credits: { type: Number, default: 3 },
  createdAt: { type: Date, default: Date.now }
});

const assignmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  subjectName: { type: String, default: 'General' },
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  task: { type: String, required: true },
  duration: { type: Number, default: 1 }, // hours
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const gradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  grade: { type: Number, required: true }, // grade points (0-4 scale)
  credits: { type: Number, required: true },
  semester: { type: String, default: 'Current' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Subject: mongoose.model('Subject', subjectSchema),
  Assignment: mongoose.model('Assignment', assignmentSchema),
  StudyPlan: mongoose.model('StudyPlan', studyPlanSchema),
  Grade: mongoose.model('Grade', gradeSchema)
};
