const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification, emitNotification } = require('../services/notificationService');
const { getIO } = require('../sockets');

// @desc    Send a message in a conversation
// @route   POST /api/messages
// @access  Private (participant)
const sendMessage = asyncHandler(async (req, res) => {
    const { conversationId, content } = req.body;

    if (!conversationId || !content) {
        res.status(400);
        throw new Error('Conversation and message content are required');
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
        (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
        res.status(403);
        throw new Error('Not authorized to send messages in this conversation');
    }

    const message = await Message.create({
        conversation: conversationId,
        sender: req.user._id,
        content,
        readBy: [req.user._id],
    });

    // Update conversation last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = Date.now();
    await conversation.save();

    // Notify the other participant
    const otherParticipant = conversation.participants.find(
        (p) => p.toString() !== req.user._id.toString()
    );

    const notification = await createNotification({
        recipient: otherParticipant,
        type: 'message',
        title: 'New message',
        message: `${req.user.name}: ${content.slice(0, 100)}`,
        relatedRecord: conversationId,
        relatedModel: 'Conversation',
    });

    // Emit real-time message and notification
    try {
        const io = getIO();
        io.to(`conversation_${conversationId}`).emit('message', message);
        emitNotification(io, otherParticipant, notification);
    } catch (e) { }

    res.status(201).json({ success: true, data: message });
});

// @desc    Get messages for a conversation
// @route   GET /api/messages/conversation/:conversationId
// @access  Private (participant)
const getMessages = asyncHandler(async (req, res) => {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
        (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
        res.status(403);
        throw new Error('Not authorized to view these messages');
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversation._id })
        .populate('sender', 'name profileImage')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    // Mark messages as read by current user
    await Message.updateMany(
        {
            conversation: conversation._id,
            sender: { $ne: req.user._id },
            readBy: { $ne: req.user._id },
        },
        { $addToSet: { readBy: req.user._id }, readAt: Date.now() }
    );

    res.json({ success: true, data: messages.reverse() });
});

// @desc    Mark all messages in a conversation as read
// @route   PUT /api/messages/read/:conversationId
// @access  Private (participant)
const markAsRead = asyncHandler(async (req, res) => {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
        (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
        res.status(403);
        throw new Error('Not authorized');
    }

    await Message.updateMany(
        {
            conversation: conversation._id,
            sender: { $ne: req.user._id },
            readBy: { $ne: req.user._id },
        },
        { $addToSet: { readBy: req.user._id }, readAt: Date.now() }
    );

    res.json({ success: true, message: 'Messages marked as read' });
});

module.exports = {
    sendMessage,
    getMessages,
    markAsRead,
};