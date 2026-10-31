const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Notification.countDocuments({ recipient: req.user._id });
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        data: notifications,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        recipient: req.user._id,
        read: false,
    });
    res.json({ success: true, count });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this notification');
    }

    notification.read = true;
    notification.readAt = Date.now();
    await notification.save();

    res.json({ success: true, data: notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, read: false },
        { read: true, readAt: Date.now() }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this notification');
    }

    await notification.remove();
    res.json({ success: true, message: 'Notification deleted' });
});

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};