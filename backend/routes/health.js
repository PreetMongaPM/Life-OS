const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/healthController');
const auth = require('../middleware/auth');

router.post('/log', auth, ctrl.logHealth);
router.get('/log', auth, ctrl.getLogs);
router.get('/today', auth, ctrl.getToday);
router.get('/weekly', auth, ctrl.getWeeklyStats);

module.exports = router;
