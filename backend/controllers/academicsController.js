const { Subject, Assignment, StudyPlan, Grade } = require('../models/Academics');

// ===== SUBJECTS =====
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addSubject = async (req, res) => {
  try {
    const { name, color, credits } = req.body;
    if (!name) return res.status(400).json({ message: 'Subject name required.' });
    const subject = new Subject({ userId: req.user.id, name, color, credits });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteSubject = async (req, res) => {
  try {
    await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Subject deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== ASSIGNMENTS =====
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.user.id }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addAssignment = async (req, res) => {
  try {
    const { title, subjectName, dueDate, priority, subjectId } = req.body;
    if (!title || !dueDate) return res.status(400).json({ message: 'Title and due date required.' });
    const assignment = new Assignment({ userId: req.user.id, title, subjectName, dueDate, priority, subjectId });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(assignment);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Assignment deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== STUDY PLANS =====
exports.getStudyPlans = async (req, res) => {
  try {
    const { date } = req.query;
    const query = { userId: req.user.id };
    if (date) query.date = date;
    const plans = await StudyPlan.find(query).sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addStudyPlan = async (req, res) => {
  try {
    const { date, task, duration } = req.body;
    if (!task || !date) return res.status(400).json({ message: 'Task and date required.' });
    const plan = new StudyPlan({ userId: req.user.id, date, task, duration });
    await plan.save();
    res.status(201).json(plan);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plan) return res.status(404).json({ message: 'Plan not found.' });
    plan.completed = !plan.completed;
    await plan.save();
    res.json(plan);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteStudyPlan = async (req, res) => {
  try {
    await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Study plan deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ===== GRADES / GPA =====
exports.getGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ userId: req.user.id });
    res.json(grades);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addGrade = async (req, res) => {
  try {
    const { subject, grade, credits, semester } = req.body;
    const g = new Grade({ userId: req.user.id, subject, grade, credits, semester });
    await g.save();
    res.status(201).json(g);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteGrade = async (req, res) => {
  try {
    await Grade.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Grade deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.calculateGPA = async (req, res) => {
  try {
    const grades = await Grade.find({ userId: req.user.id });
    if (!grades.length) return res.json({ gpa: 0, totalCredits: 0 });
    const totalPoints = grades.reduce((sum, g) => sum + g.grade * g.credits, 0);
    const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
    res.json({ gpa, totalCredits, totalCourses: grades.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
