const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reportType: {
            type: String,
            enum: ['user', 'project', 'message', 'proposal', 'other'],
            required: true,
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        targetProject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            default: null,
        },
        targetMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null,
        },
        reason: {
            type: String,
            required: [true, 'Reason is required'],
            trim: true,
            maxlength: [2000, 'Reason cannot exceed 2000 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
            default: 'pending',
        },
        adminNote: {
            type: String,
            trim: true,
            default: '',
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        resolvedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Report', reportSchema);