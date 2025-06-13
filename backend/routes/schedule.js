const express = require('express');
const router = express.Router();
const { createSchedule, getSchedules, deleteSchedule, updateSchedule } = require('../controllers/schedule');
const { auth } = require('../middleware/auth');

router.post('/user/schedule', auth, createSchedule);
router.get('/user/schedule', auth, getSchedules);
router.delete('/user/schedule/:id', auth, deleteSchedule);
router.put('/user/schedule/:id', auth, updateSchedule);
module.exports = router;
