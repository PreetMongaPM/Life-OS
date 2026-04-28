const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/academicsController');
const auth = require('../middleware/auth');

// Subjects
router.get('/subjects', auth, ctrl.getSubjects);
router.post('/subjects', auth, ctrl.addSubject);
router.delete('/subjects/:id', auth, ctrl.deleteSubject);

// Assignments
router.get('/assignments', auth, ctrl.getAssignments);
router.post('/assignments', auth, ctrl.addAssignment);
router.put('/assignments/:id', auth, ctrl.updateAssignment);
router.delete('/assignments/:id', auth, ctrl.deleteAssignment);

// Study Plans
router.get('/study-plans', auth, ctrl.getStudyPlans);
router.post('/study-plans', auth, ctrl.addStudyPlan);
router.put('/study-plans/:id/toggle', auth, ctrl.toggleStudyPlan);
router.delete('/study-plans/:id', auth, ctrl.deleteStudyPlan);

// Grades / GPA
router.get('/grades', auth, ctrl.getGrades);
router.post('/grades', auth, ctrl.addGrade);
router.delete('/grades/:id', auth, ctrl.deleteGrade);
router.get('/gpa', auth, ctrl.calculateGPA);

module.exports = router;
