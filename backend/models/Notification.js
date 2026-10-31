const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: [
                'offer',
                'proposal',
                'message',
                'hire',
                'project',
                'account',
                'report',
                'system',
            ],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            trim: true,
            default: '',
        },
        relatedRecord: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        relatedModel: {
            type: String,
            default: '',
        },
        read: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for fetching user notifications
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);