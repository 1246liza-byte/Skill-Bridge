const Review = require('../models/Review');
const Hire = require('../models/Hire');
const StudentProfile = require('../models/StudentProfile');
const ClientProfile = require('../models/ClientProfile');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a review for a completed hire
// @route   POST /api/reviews
// @access  Private (participant of completed hire)
const createReview = asyncHandler(async (req, res) => {
    const { hire, rating, comment } = req.body;

    if (!hire || !rating) {
        res.status(400);
        throw new Error('Hire and rating are required');
    }

    const hireDoc = await Hire.findById(hire);
    if (!hireDoc) {
        res.status(404);
        throw new Error('Hire not found');
    }

    if (hireDoc.status !== 'completed') {
        res.status(400);
        throw new Error('Reviews can only be submitted for completed hires');
    }

    const isParticipant =
        hireDoc.client.toString() === req.user._id.toString() ||
        hireDoc.student.toString() === req.user._id.toString();
    if (!isParticipant) {
        res.status(403);
        throw new Error('Not authorized to review this hire');
    }

    // Determine reviewee
    const reviewee =
        req.user._id.toString() === hireDoc.client.toString()
            ? hireDoc.student
            : hireDoc.client;

    const review = await Review.create({
        hire,
        reviewer: req.user._id,
        reviewee,
        rating,
        comment,
    });

    // Update reviewee's rating
    const allReviews = await Review.find({ reviewee });
    const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    if (reviewee.toString() === hireDoc.student.toString()) {
        await StudentProfile.findOneAndUpdate(
            { user: reviewee },
            { rating: avgRating, ratingCount: allReviews.length }
        );
    } else {
        await ClientProfile.findOneAndUpdate(
            { user: reviewee },
            { rating: avgRating, ratingCount: allReviews.length }
        );
    }

    res.status(201).json({ success: true, data: review });
});

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ reviewee: req.params.userId })
        .populate('reviewer', 'name profileImage')
        .sort('-createdAt');
    res.json({ success: true, data: reviews });
});

module.exports = {
    createReview,
    getUserReviews,
};