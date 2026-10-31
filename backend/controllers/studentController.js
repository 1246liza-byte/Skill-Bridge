const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const HiringOffer = require('../models/HiringOffer');
const Hire = require('../models/Hire');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const asyncHandler = require('../utils/asyncHandler');

// Helper to calculate profile completion percentage
const calculateProfileCompletion = (profile) => {
    let score = 0;
    const checks = [
        profile.headline,
        profile.bio,
        profile.skills && profile.skills.length > 0,
        profile.education && profile.education.length > 0,
        profile.portfolio && profile.portfolio.length > 0,
        profile.availability,
        profile.hourlyRate > 0 || profile.projectRate > 0,
        profile.profileImage,
    ];
    checks.forEach((c) => {
        if (c) score += 1;
    });
    return Math.round((score / checks.length) * 100);
};

// @desc    Get student dashboard stats
// @route   GET /api/students/dashboard
// @access  Private (student)
const getDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [profile, proposals, offers, hires, unreadMessages, unreadNotifications] =
        await Promise.all([
            StudentProfile.findOne({ user: userId }),
            Proposal.find({ student: userId }),
            HiringOffer.find({ student: userId }),
            Hire.find({ student: userId }),
            Conversation.countDocuments({
                participants: userId,
                lastMessageAt: { $exists: true },
            }),
            Notification.countDocuments({ recipient: userId, read: false }),
        ]);

    const activeHires = hires.filter((h) => h.status === 'active');
    const completedHires = hires.filter((h) => h.status === 'completed');

    res.json({
        success: true,
        data: {
            profileCompletion: profile ? profile.profileCompletion : 0,
            totalProposals: proposals.length,
            pendingProposals: proposals.filter((p) => p.status === 'pending').length,
            acceptedProposals: proposals.filter((p) => p.status === 'accepted').length,
            totalOffers: offers.length,
            pendingOffers: offers.filter((o) => o.status === 'pending').length,
            activeProjects: activeHires.length,
            completedProjects: completedHires.length,
            unreadMessages,
            unreadNotifications,
        },
    });
});

// @desc    Get or create student profile
// @route   GET /api/students/profile
// @access  Private (student)
const getProfile = asyncHandler(async (req, res) => {
    let profile = await StudentProfile.findOne({ user: req.user._id }).populate(
        'preferredCategories'
    );
    if (!profile) {
        profile = await StudentProfile.create({ user: req.user._id });
    }
    res.json({ success: true, data: profile });
});

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (student)
const updateProfile = asyncHandler(async (req, res) => {
    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
        profile = await StudentProfile.create({ user: req.user._id });
    }

    const fields = [
        'headline',
        'bio',
        'skills',
        'education',
        'experience',
        'certifications',
        'availability',
        'preferredCategories',
        'hourlyRate',
        'projectRate',
        'location',
    ];

    fields.forEach((field) => {
        if (req.body[field] !== undefined) {
            profile[field] = req.body[field];
        }
    });

    // Update profile image on user if provided
    if (req.body.profileImage) {
        await User.findByIdAndUpdate(req.user._id, { profileImage: req.body.profileImage });
    }

    profile.profileCompletion = calculateProfileCompletion(profile);
    await profile.save();

    res.json({ success: true, data: profile });
});

// @desc    Add portfolio item
// @route   POST /api/students/portfolio
// @access  Private (student)
const addPortfolio = asyncHandler(async (req, res) => {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
        res.status(404);
        throw new Error('Profile not found');
    }

    const { title, description, image, link, category } = req.body;
    if (!title) {
        res.status(400);
        throw new Error('Portfolio title is required');
    }

    profile.portfolio.push({ title, description, image, link, category });
    profile.profileCompletion = calculateProfileCompletion(profile);
    await profile.save();

    res.status(201).json({ success: true, data: profile.portfolio });
});

// @desc    Update portfolio item
// @route   PUT /api/students/portfolio/:id
// @access  Private (student)
const updatePortfolio = asyncHandler(async (req, res) => {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
        res.status(404);
        throw new Error('Profile not found');
    }

    const item = profile.portfolio.id(req.params.id);
    if (!item) {
        res.status(404);
        throw new Error('Portfolio item not found');
    }

    const { title, description, image, link, category } = req.body;
    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (image !== undefined) item.image = image;
    if (link !== undefined) item.link = link;
    if (category !== undefined) item.category = category;

    await profile.save();
    res.json({ success: true, data: profile.portfolio });
});

// @desc    Delete portfolio item
// @route   DELETE /api/students/portfolio/:id
// @access  Private (student)
const deletePortfolio = asyncHandler(async (req, res) => {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
        res.status(404);
        throw new Error('Profile not found');
    }

    const item = profile.portfolio.id(req.params.id);
    if (!item) {
        res.status(404);
        throw new Error('Portfolio item not found');
    }

    item.remove();
    profile.profileCompletion = calculateProfileCompletion(profile);
    await profile.save();

    res.json({ success: true, message: 'Portfolio item deleted' });
});

// @desc    Get student's proposals
// @route   GET /api/students/proposals
// @access  Private (student)
const getMyProposals = asyncHandler(async (req, res) => {
    const proposals = await Proposal.find({ student: req.user._id })
        .populate('project', 'title budget status category')
        .sort('-createdAt');
    res.json({ success: true, data: proposals });
});

// @desc    Get student's hiring offers
// @route   GET /api/students/offers
// @access  Private (student)
const getMyOffers = asyncHandler(async (req, res) => {
    const offers = await HiringOffer.find({ student: req.user._id })
        .populate('client', 'name profileImage companyName')
        .populate('project', 'title description budget')
        .sort('-createdAt');
    res.json({ success: true, data: offers });
});

// @desc    Get student's hires
// @route   GET /api/students/hires
// @access  Private (student)
const getMyHires = asyncHandler(async (req, res) => {
    const hires = await Hire.find({ student: req.user._id })
        .populate('client', 'name profileImage companyName')
        .populate('project', 'title description')
        .sort('-createdAt');
    res.json({ success: true, data: hires });
});

// @desc    Get public student profile by id
// @route   GET /api/students/:id
// @access  Public
const getPublicProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('name profileImage role status');
    if (!user || user.role !== 'student') {
        res.status(404);
        throw new Error('Student not found');
    }

    const profile = await StudentProfile.findOne({ user: user._id }).populate(
        'preferredCategories'
    );
    res.json({ success: true, data: { user, profile } });
});

// @desc    Get all students (public directory)
// @route   GET /api/students
// @access  Public
const getAllStudents = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const { search, skill, availability } = req.query;

    const userQuery = { role: 'student', status: 'active' };
    if (search) {
        userQuery.name = { $regex: search, $options: 'i' };
    }

    const users = await User.find(userQuery).select('name profileImage').skip(skip).limit(limit);

    const userIds = users.map((u) => u._id);

    const profileQuery = { user: { $in: userIds } };
    if (skill) {
        profileQuery['skills.name'] = { $regex: skill, $options: 'i' };
    }
    if (availability) {
        profileQuery.availability = availability;
    }

    const profiles = await StudentProfile.find(profileQuery).populate('preferredCategories');

    const total = await User.countDocuments(userQuery);

    res.json({
        success: true,
        data: profiles,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

module.exports = {
    getDashboard,
    getProfile,
    updateProfile,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    getMyProposals,
    getMyOffers,
    getMyHires,
    getPublicProfile,
    getAllStudents,
};