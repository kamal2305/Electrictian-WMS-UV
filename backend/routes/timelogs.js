const express = require('express');
const router = express.Router();
const { checkout, getTimelogsByJob, getAttendanceReport, getHoursReport } = require('../controllers/timelogController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.put('/:id/checkout', checkout);
router.get('/job/:jobId', getTimelogsByJob);
router.get('/reports/attendance', getAttendanceReport);
router.get('/reports/hours', getHoursReport);
router.get('/attendance', getAttendanceReport);
router.get('/hours', getHoursReport);

module.exports = router;
