const express = require('express');
const router = express.Router();
const {
    createReport,
    getReports,
    updateReport,
    deleteReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// Authenticated users can submit reports
router.post('/', protect, createReport);

// Admin
router.get('/', protect, authorize('admin'), getReports);
router.put('/:id', protect, authorize('admin'), updateReport);
router.delete('/:id', protect, authorize('admin'), deleteReport);

module.exports = router;