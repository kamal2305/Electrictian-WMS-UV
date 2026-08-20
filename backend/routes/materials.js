const express = require('express');
const router = express.Router();
const { getMaterials, getMaterial, getMaterialsByJob, createMaterial, createMaterialForJob, updateMaterial, deleteMaterial, getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, getMaterialRequests, createMaterialRequest, getMaterialUsage, createMaterialUsage } = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/inventory', getInventory);
router.post('/inventory', authorize('admin'), createInventoryItem);
router.put('/inventory/:id', authorize('admin'), updateInventoryItem);
router.delete('/inventory/:id', authorize('admin'), deleteInventoryItem);
router.get('/requests', getMaterialRequests);
router.post('/requests', createMaterialRequest);
router.get('/usage', getMaterialUsage);
router.post('/usage', createMaterialUsage);
router.get('/job/:jobId', getMaterialsByJob);
router.post('/job/:jobId', createMaterialForJob);
router.route('/').get(getMaterials).post(authorize('admin'), createMaterial);
router.route('/:id').get(getMaterial).put(authorize('admin'), updateMaterial).delete(authorize('admin'), deleteMaterial);

module.exports = router;
