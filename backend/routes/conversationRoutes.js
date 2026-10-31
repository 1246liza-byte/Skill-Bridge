const express = require('express');
const router = express.Router();
const {
    createConversation,
    getConversations,
    getConversation,
} = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');

// Protected routes
router.post('/', protect, createConversation);
router.get('/', protect, getConversations);
router.get('/:id', protect, getConversation);

module.exports = router;