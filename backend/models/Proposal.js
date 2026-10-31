const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        coverLetter: {
            type: String,
            required: [true, 'Cover letter is required'],
            trim: true,
            maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
        },
        proposedBudget: {
            type: Number,
            min: 0,
            required: true,
        },
        proposedTimeline: {
            type: String,
            trim: true,
            default: '',
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
            default: 'pending',
        },
        clientResponse: {
            type: String,
            trim: true,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate proposals from same student on same project
proposalSchema.index({ project: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Proposal', proposalSchema);