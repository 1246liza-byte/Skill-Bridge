const User = require('../models/User');
const ClientProfile = require('../models/ClientProfile');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const HiringOffer = require('../models/HiringOffer');
const Hire = require('../models/Hire');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get client dashboard stats
// @route   GET /api/clients/dashboard
// @access  Private (client)
const getDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [projects, proposals, offers, hires, unreadMessages, unreadNotifications] =
        await Promise.all([
            Project.find({ owner: userId }),
            Proposal.find({}).populate('project'),
            HiringOffer.find({ client: userId }),
            Hire.find({ client: userId }),
            Conversation.countDocuments({ participants: userId }),
            Notification.countDocuments({ recipient: userId, read: false }),
        ]);

    // Proposals for this client's projects
    const myProjectIds = projects.map((p) => p._id);
    const myProposals = proposals.filter((p) =>
        myProjectIds.includes(p.project && p.project._id)
    );

    res.json({
        success: true,
        data: {
            totalProjects: projects.length,
            openProjects: projects.filter((p) => p.status === 'open').length,
            totalProposals: myProposals.length,
            pendingProposals: myProposals.filter((p) => p.status === 'pending').length,
            totalOffers: offers.length,
            pendingOffers: offers.filter((o) => o.status === 'pending').length,
            activeHires: hires.filter((h) => h.status === 'active').length,
            completedProjects: hires.filter((h) => h.status === 'completed').length,
            unreadMessages,
            unreadNotifications,
        },
    });
});

// @desc    Get or create client profile
// @route   GET /api/clients/profile
// @access  Private (client)
const getProfile = asyncHandler(async (req, res) => {
    let profile = await ClientProfile.findOne({ user: req.user._id });
    if (!profile) {
        profile = await ClientProfile.create({ user: req.user._id });
    }
    res.json({ success: true, data: profile });
});

// @desc    Update client profile
// @route   PUT /api/clients/profile
// @access  Private (client)
const updateProfile = asyncHandler(async (req, res) => {
    let profile = await ClientProfile.findOne({ user: req.user._id });
    if (!profile) {
        profile = await ClientProfile.create({ user: req.user._id });
    }

    const fields = [
        'companyName',
        'companyDescription',
        'website',
        'industry',
        'location',
        'contactPhone',
    ];

    fields.forEach((field) => {
        if (req.body[field] !== undefined) {
            profile[field] = req.body[field];
        }
    });

    // Update user fields
    const userUpdate = {};
    if (req.body.name) userUpdate.name = req.body.name;
    if (req.body.companyName) userUpdate.companyName = req.body.companyName;
    if (req.body.profileImage) userUpdate.profileImage = req.body.profileImage;
    if (Object.keys(userUpdate).length > 0) {
        await User.findByIdAndUpdate(req.user._id, userUpdate);
    }

    await profile.save();
    res.json({ success: true, data: profile });
});

// @desc    Save/shortlist a student
// @route   PUT /api/clients/save-student/:id
// @access  Private (client)
const saveStudent = asyncHandler(async (req, res) => {
    const studentId = req.params.id;
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
        res.status(404);
        throw new Error('Student not found');
    }

    let profile = await ClientProfile.findOne({ user: req.user._id });
    if (!profile) {
        profile = await ClientProfile.create({ user: req.user._id });
    }

    if (profile.savedStudents.includes(studentId)) {
        profile.savedStudents = profile.savedStudents.filter(
            (id) => id.toString() !== studentId.toString()
        );
    } else {
        profile.savedStudents.push(studentId);
    }

    await profile.save();
    res.json({ success: true, data: profile.savedStudents });
});

// @desc    Get client's saved students
// @route   GET /api/clients/saved-students
// @access  Private (client)
const getSavedStudents = asyncHandler(async (req, res) => {
    const profile = await ClientProfile.findOne({ user: req.user._id }).populate(
        'savedStudents',
        'name profileImage'
    );
    res.json({ success: true, data: profile ? profile.savedStudents : [] });
});

// @desc    Get client's posted projects
// @route   GET /api/clients/projects
// @access  Private (client)
const getMyProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({ owner: req.user._id })
        .populate('category', 'name')
        .sort('-createdAt');
    res.json({ success: true, data: projects });
});

// @desc    Get proposals for a client's project
// @route   GET /api/clients/projects/:id/proposals
// @access  Private (client)
const getProjectProposals = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }
    if (project.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view these proposals');
    }

    const proposals = await Proposal.find({ project: project._id })
        .populate('student', 'name profileImage')
        .sort('-createdAt');
    res.json({ success: true, data: proposals });
});

// @desc    Get client's hiring offers
// @route   GET /api/clients/offers
// @access  Private (client)
const getMyOffers = asyncHandler(async (req, res) => {
    const offers = await HiringOffer.find({ client: req.user._id })
        .populate('student', 'name profileImage')
        .populate('project', 'title')
        .sort('-createdAt');
    res.json({ success: true, data: offers });
});

// @desc    Get client's hires
// @route   GET /api/clients/hires
// @access  Private (client)
const getMyHires = asyncHandler(async (req, res) => {
    const hires = await Hire.find({ client: req.user._id })
        .populate('student', 'name profileImage')
        .populate('project', 'title')
        .sort('-createdAt');
    res.json({ success: true, data: hires });
});

module.exports = {
    getDashboard,
    getProfile,
    updateProfile,
    saveStudent,
    getSavedStudents,
    getMyProjects,
    getProjectProposals,
    getMyOffers,
    getMyHires,
};