const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getDashboardStats,
  getElectricianDashboardStats,
  repairMaterials
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('admin'), getAnalytics);
router.get('/dashboard', getDashboardStats);
router.get('/stats', getDashboardStats);
router.get('/electrician/:id/stats', getElectricianDashboardStats);
router.post('/electrician/:id/repair-materials', repairMaterials);

module.exports = router;
