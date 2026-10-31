const mongoose = require('mongoose');

const hireSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
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
        source: {
            type: String,
            enum: ['proposal', 'offer'],
            required: true,
        },
        sourceRef: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        agreedBudget: {
            type: Number,
            min: 0,
            required: true,
        },
        agreedDeadline: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled'],
            default: 'active',
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
        },
        cancelledAt: {
            type: Date,
        },
        cancellationReason: {
            type: String,
            trim: true,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate active hires for same project+student
hireSchema.index({ project: 1, student: 1, status: 1 });

module.exports = mongoose.model('Hire', hireSchema);