const express = require('express');
const router = express.Router();
const { getElectricians, getElectrician, getAllUsers, createElectrician, updateElectrician, deleteElectrician } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getAllUsers);
router.get('/electricians', getElectricians);
router.get('/electricians/:id', getElectrician);
router.post('/electricians', authorize('admin'), createElectrician);
router.put('/electricians/:id', authorize('admin'), updateElectrician);
router.delete('/electricians/:id', authorize('admin'), deleteElectrician);

module.exports = router;
