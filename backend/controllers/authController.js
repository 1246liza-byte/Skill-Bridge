const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const ClientProfile = require('../models/ClientProfile');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');

// @desc    Register a new student
// @route   POST /api/auth/register/student
// @access  Public
const registerStudent = asyncHandler(async (req, res) => {
    const { name, email, password, profileImage } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('An account with this email already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: 'student',
        profileImage: profileImage || '',
    });

    // Create empty student profile
    await StudentProfile.create({ user: user._id });

    res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            status: user.status,
        },
    });
});

// @desc    Register a new client
// @route   POST /api/auth/register/client
// @access  Public
const registerClient = asyncHandler(async (req, res) => {
    const { name, companyName, email, password, profileImage } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('An account with this email already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: 'client',
        companyName: companyName || '',
        profileImage: profileImage || '',
    });

    // Create empty client profile
    await ClientProfile.create({ user: user._id, companyName: companyName || '' });

    res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyName: user.companyName,
            profileImage: user.profileImage,
            status: user.status,
        },
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    if (user.status === 'suspended') {
        res.status(403);
        throw new Error('Your account has been suspended. Please contact support.');
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    res.json({
        success: true,
        token: generateToken(user._id),
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            companyName: user.companyName,
            status: user.status,
        },
    });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
});

// @desc    Forgot password - generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('No account found with that email');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // In production, send email with reset link
    // For development, return the token in response
    res.json({
        success: true,
        message: 'Password reset token generated. Check your email.',
        resetToken: process.env.NODE_ENV === 'production' ? undefined : resetToken,
    });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired reset token');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
        success: true,
        message: 'Password reset successful. You can now login.',
        token: generateToken(user._id),
    });
});

// @desc    Change password (logged in user)
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        res.status(400);
        throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
});

module.exports = {
    registerStudent,
    registerClient,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    changePassword,
};