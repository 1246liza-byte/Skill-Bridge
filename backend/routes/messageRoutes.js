const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getMessages,
    markAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Protected routes
router.post('/', protect, sendMessage);
router.get('/conversation/:conversationId', protect, getMessages);
router.put('/read/:conversationId', protect, markAsRead);

module.exports = router;