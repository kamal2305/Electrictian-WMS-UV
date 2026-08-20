const express = require('express');
const router = express.Router();
const { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, downloadPDF } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/:id/pdf', downloadPDF);
router.route('/').get(getInvoices).post(authorize('admin'), createInvoice);
router.route('/:id').get(getInvoice).put(authorize('admin'), updateInvoice).delete(authorize('admin'), deleteInvoice);

module.exports = router;
