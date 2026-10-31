const mongoose = require('mongoose');

const hiringOfferSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        budget: {
            type: Number,
            min: 0,
            required: true,
        },
        deadline: {
            type: Date,
        },
        message: {
            type: String,
            trim: true,
            maxlength: [2000, 'Message cannot exceed 2000 characters'],
            default: '',
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'expired'],
            default: 'pending',
        },
        decisionDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('HiringOffer', hiringOfferSchema);