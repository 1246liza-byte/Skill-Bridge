const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Project title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Project description is required'],
            trim: true,
            maxlength: [5000, 'Description cannot exceed 5000 characters'],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        requiredSkills: [
            {
                type: String,
                trim: true,
            },
        ],
        budgetType: {
            type: String,
            enum: ['fixed', 'hourly', 'range'],
            default: 'fixed',
        },
        budget: {
            type: Number,
            min: 0,
            default: 0,
        },
        budgetMin: {
            type: Number,
            min: 0,
            default: 0,
        },
        budgetMax: {
            type: Number,
            min: 0,
            default: 0,
        },
        deadline: {
            type: Date,
        },
        projectType: {
            type: String,
            enum: ['one-time', 'ongoing', 'contract'],
            default: 'one-time',
        },
        status: {
            type: String,
            enum: ['draft', 'open', 'in-progress', 'completed', 'closed', 'cancelled'],
            default: 'draft',
        },
        visibility: {
            type: String,
            enum: ['public', 'private'],
            default: 'public',
        },
        featured: {
            type: Boolean,
            default: false,
        },
        proposalCount: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
        hiredStudent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index for search
projectSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Project', projectSchema);