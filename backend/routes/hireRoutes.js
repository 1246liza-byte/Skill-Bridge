const express = require('express');
const router = express.Router();
const { getHire, completeHire, cancelHire } = require('../controllers/hireController');
const { protect } = require('../middleware/auth');

// Protected routes
router.get('/:id', protect, getHire);
router.put('/:id/complete', protect, completeHire);
router.put('/:id/cancel', protect, cancelHire);

module.exports = router;