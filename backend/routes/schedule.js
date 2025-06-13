const express = require('express');
const router = express.Router();
const { createSchedule, getSchedules } = require('../controllers/schedule');
const { auth } = require('../middleware/auth');

router.post('/user/schedule', auth, createSchedule);
router.get('/user/schedule', auth, getSchedules);

module.exports = router;
