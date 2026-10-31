const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get or create a conversation with another user
// @route   POST /api/conversations
// @access  Private
const createConversation = asyncHandler(async (req, res) => {
    const { participantId, projectId } = req.body;

    if (!participantId) {
        res.status(400);
        throw new Error('Participant is required');
    }

    const participant = await User.findById(participantId);
    if (!participant) {
        res.status(404);
        throw new Error('User not found');
    }

    if (participantId.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Cannot start a conversation with yourself');
    }

    // Check for existing conversation between the two users
    let conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, participantId] },
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [req.user._id, participantId],
            project: projectId || null,
        });
    }

    res.status(201).json({ success: true, data: conversation });
});

// @desc    Get user's conversations
// @route   GET /api/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
    const conversations = await Conversation.find({
        participants: req.user._id,
    })
        .populate('participants', 'name profileImage role companyName')
        .populate('lastMessage')
        .populate('project', 'title')
        .sort('-lastMessageAt');

    // Add unread count for each conversation
    const result = await Promise.all(
        conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
                conversation: conv._id,
                sender: { $ne: req.user._id },
                readBy: { $ne: req.user._id },
            });
            return { ...conv.toObject(), unreadCount };
        })
    );

    res.json({ success: true, data: result });
});

// @desc    Get a single conversation
// @route   GET /api/conversations/:id
// @access  Private (participant)
const getConversation = asyncHandler(async (req, res) => {
    const conversation = await Conversation.findById(req.params.id)
        .populate('participants', 'name profileImage role companyName')
        .populate('project', 'title');

    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
        (p) => p._id.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
        res.status(403);
        throw new Error('Not authorized to view this conversation');
    }

    res.json({ success: true, data: conversation });
});

module.exports = {
    createConversation,
    getConversations,
    getConversation,
};