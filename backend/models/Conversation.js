const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            default: null,
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null,
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure exactly 2 participants per conversation
conversationSchema.pre('validate', function (next) {
    if (this.participants.length !== 2) {
        return next(new Error('A conversation must have exactly 2 participants'));
    }
    next();
});

// Prevent duplicate conversations between same pair
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);