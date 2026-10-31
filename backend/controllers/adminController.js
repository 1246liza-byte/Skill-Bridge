const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const ClientProfile = require('../models/ClientProfile');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const HiringOffer = require('../models/HiringOffer');
const Hire = require('../models/Hire');
const Report = require('../models/Report');
const ContactMessage = require('../models/ContactMessage');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');

// Helper to log admin actions
const logAction = async (adminId, action, targetType, targetId, details = {}, ip = '') => {
    try {
        await AuditLog.create({ admin: adminId, action, targetType, targetId, details, ip });
    } catch (e) {
        console.error('Audit log error:', e.message);
    }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboard = asyncHandler(async (req, res) => {
    const [
        totalStudents,
        totalClients,
        totalUsers,
        totalProjects,
        openProjects,
        totalProposals,
        activeHires,
        completedProjects,
        pendingReports,
        unreadContacts,
    ] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'client' }),
        User.countDocuments({}),
        Project.countDocuments({}),
        Project.countDocuments({ status: 'open' }),
        Proposal.countDocuments({}),
        Hire.countDocuments({ status: 'active' }),
        Hire.countDocuments({ status: 'completed' }),
        Report.countDocuments({ status: 'pending' }),
        ContactMessage.countDocuments({ status: 'unread' }),
    ]);

    // Recent activity
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name role createdAt');
    const recentProjects = await Project.find().sort('-createdAt').limit(5).select('title status createdAt');

    res.json({
        success: true,
        data: {
            totalStudents,
            totalClients,
            totalUsers,
            totalProjects,
            openProjects,
            totalProposals,
            activeHires,
            completedProjects,
            pendingReports,
            unreadContacts,
            recentUsers,
            recentProjects,
        },
    });
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { role, search, status, sort } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { companyName: { $regex: search, $options: 'i' } },
        ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-password')
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        data: users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

// @desc    Get a single user (admin)
// @route   GET /api/admin/users/:id
// @access  Private (admin)
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    let profile = null;
    if (user.role === 'student') {
        profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'client') {
        profile = await ClientProfile.findOne({ user: user._id });
    }

    res.json({ success: true, data: { user, profile } });
});

// @desc    Update a user (admin)
// @route   PUT /api/admin/users/:id
// @access  Private (admin)
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Prevent privilege escalation
    if (req.body.role && req.body.role !== user.role) {
        res.status(400);
        throw new Error('Role changes are not permitted through this endpoint');
    }

    const fields = ['name', 'status', 'companyName', 'profileImage'];
    fields.forEach((field) => {
        if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();

    await logAction(
        req.user._id,
        'update_user',
        'User',
        user._id,
        { fields: Object.keys(req.body) },
        req.ip
    );

    res.json({ success: true, data: user });
});

// @desc    Suspend a user (admin)
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (admin)
const suspendUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot suspend an admin account');
    }

    user.status = 'suspended';
    await user.save();

    await logAction(req.user._id, 'suspend_user', 'User', user._id, {}, req.ip);
    res.json({ success: true, message: 'User suspended', data: user });
});

// @desc    Restore a user (admin)
// @route   PUT /api/admin/users/:id/restore
// @access  Private (admin)
const restoreUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.status = 'active';
    await user.save();

    await logAction(req.user._id, 'restore_user', 'User', user._id, {}, req.ip);
    res.json({ success: true, message: 'User restored', data: user });
});

// @desc    Delete a user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot delete an admin account');
    }

    // Delete related profiles
    if (user.role === 'student') {
        await StudentProfile.deleteOne({ user: user._id });
    } else if (user.role === 'client') {
        await ClientProfile.deleteOne({ user: user._id });
    }

    await user.remove();

    await logAction(req.user._id, 'delete_user', 'User', user._id, {}, req.ip);
    res.json({ success: true, message: 'User deleted' });
});

// @desc    Get all projects (admin)
// @route   GET /api/admin/projects
// @access  Private (admin)
const getProjects = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { search, status, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
        .populate('owner', 'name email')
        .populate('category', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        data: projects,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

// @desc    Update a project (admin)
// @route   PUT /api/admin/projects/:id
// @access  Private (admin)
const updateProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const fields = ['title', 'description', 'status', 'visibility', 'featured', 'category'];
    fields.forEach((field) => {
        if (req.body[field] !== undefined) project[field] = req.body[field];
    });

    await project.save();

    await logAction(req.user._id, 'update_project', 'Project', project._id, {}, req.ip);
    res.json({ success: true, data: project });
});

// @desc    Delete a project (admin)
// @route   DELETE /api/admin/projects/:id
// @access  Private (admin)
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    await Proposal.deleteMany({ project: project._id });
    await project.remove();

    await logAction(req.user._id, 'delete_project', 'Project', project._id, {}, req.ip);
    res.json({ success: true, message: 'Project deleted' });
});

// @desc    Get all proposals (admin)
// @route   GET /api/admin/proposals
// @access  Private (admin)
const getProposals = asyncHandler(async (req, res) => {
    const proposals = await Proposal.find()
        .populate('project', 'title')
        .populate('student', 'name email')
        .sort('-createdAt')
        .limit(100);
    res.json({ success: true, data: proposals });
});

// @desc    Get all hires (admin)
// @route   GET /api/admin/hires
// @access  Private (admin)
const getHires = asyncHandler(async (req, res) => {
    const hires = await Hire.find()
        .populate('project', 'title')
        .populate('client', 'name')
        .populate('student', 'name')
        .sort('-createdAt')
        .limit(100);
    res.json({ success: true, data: hires });
});

// @desc    Get audit logs (admin)
// @route   GET /api/admin/audit-logs
// @access  Private (admin)
const getAuditLogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await AuditLog.countDocuments({});
    const logs = await AuditLog.find()
        .populate('admin', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        data: logs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

module.exports = {
    getDashboard,
    getUsers,
    getUser,
    updateUser,
    suspendUser,
    restoreUser,
    deleteUser,
    getProjects,
    updateProject,
    deleteProject,
    getProposals,
    getHires,
    getAuditLogs,
};