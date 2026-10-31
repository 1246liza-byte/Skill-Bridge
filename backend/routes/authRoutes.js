const express = require('express');
const router = express.Router();
const {
    registerStudent,
    registerClient,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register/student', registerStudent);
router.post('/register/client', registerClient);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;