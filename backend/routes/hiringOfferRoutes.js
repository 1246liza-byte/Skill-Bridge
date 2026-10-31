const express = require('express');
const router = express.Router();
const {
    createOffer,
    acceptOffer,
    rejectOffer,
    withdrawOffer,
} = require('../controllers/hiringOfferController');
const { protect, authorize } = require('../middleware/auth');

// Client sends offer
router.post('/', protect, authorize('client'), createOffer);

// Student accepts/rejects
router.put('/:id/accept', protect, authorize('student'), acceptOffer);
router.put('/:id/reject', protect, authorize('student'), rejectOffer);

// Client withdraws
router.put('/:id/withdraw', protect, authorize('client'), withdrawOffer);

module.exports = router;