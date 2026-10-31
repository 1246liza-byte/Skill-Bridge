const Notification = require('../models/Notification');

// Create a notification for a user
const createNotification = async ({
    recipient,
    type,
    title,
    message = '',
    relatedRecord = null,
    relatedModel = '',
}) => {
    try {
        const notification = await Notification.create({
            recipient,
            type,
            title,
            message,
            relatedRecord,
            relatedModel,
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error.message);
        return null;
    }
};

// Emit real-time notification via socket if available
const emitNotification = (io, userId, notification) => {
    if (io && userId) {
        io.to(`user_${userId}`).emit('notification', notification);
    }
};

module.exports = { createNotification, emitNotification };