const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getJobsByElectrician,
  getCurrentElectricianJobs,
  checkIn,
  getJobTimelogs
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/electrician/current', getCurrentElectricianJobs);
router.get('/electrician/:id', getJobsByElectrician);
router.route('/').get(getJobs).post(authorize('admin'), createJob);
router.route('/:id').get(getJob).put(authorize('admin'), updateJob).delete(authorize('admin'), deleteJob);
router.put('/:id/status', updateJobStatus);
router.get('/:id/timelogs', getJobTimelogs);
router.post('/:id/checkin', checkIn);

module.exports = router;
