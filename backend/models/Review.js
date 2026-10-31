const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        hire: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hire',
            required: true,
        },
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reviewee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [2000, 'Comment cannot exceed 2000 characters'],
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// One review per hire per reviewer
reviewSchema.index({ hire: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);