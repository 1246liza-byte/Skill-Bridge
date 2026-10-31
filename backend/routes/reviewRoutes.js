const express = require('express');
const router = express.Router();
const { createReview, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public
router.get('/user/:userId', getUserReviews);

// Private
router.post('/', protect, createReview);

module.exports = router;