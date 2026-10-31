const Proposal = require('../models/Proposal');
const Project = require('../models/Project');
const Hire = require('../models/Hire');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification, emitNotification } = require('../services/notificationService');
const { getIO } = require('../sockets');

// @desc    Submit a proposal
// @route   POST /api/proposals
// @access  Private (student)
const createProposal = asyncHandler(async (req, res) => {
    const { project, coverLetter, proposedBudget, proposedTimeline } = req.body;

    if (!project || !coverLetter || !proposedBudget) {
        res.status(400);
        throw new Error('Project, cover letter and proposed budget are required');
    }

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (projectDoc.status !== 'open') {
        res.status(400);
        throw new Error('This project is no longer accepting proposals');
    }

    // Check for duplicate proposal
    const existing = await Proposal.findOne({ project, student: req.user._id });
    if (existing) {
        res.status(400);
        throw new Error('You have already submitted a proposal for this project');
    }

    const proposal = await Proposal.create({
        project,
        student: req.user._id,
        coverLetter,
        proposedBudget,
        proposedTimeline,
    });

    // Increment proposal count on project
    projectDoc.proposalCount += 1;
    await projectDoc.save();

    // Notify the client
    const notification = await createNotification({
        recipient: projectDoc.owner,
        type: 'proposal',
        title: 'New proposal received',
        message: `${req.user.name} submitted a proposal for "${projectDoc.title}"`,
        relatedRecord: proposal._id,
        relatedModel: 'Proposal',
    });

    try {
        emitNotification(getIO(), projectDoc.owner, notification);
    } catch (e) {
        // Socket not initialized, fallback to DB notification
    }

    res.status(201).json({ success: true, data: proposal });
});

// @desc    Get proposals for a project (client)
// @route   GET /api/proposals/project/:projectId
// @access  Private (client owner)
const getProjectProposals = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId);
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

// @desc    Accept a proposal (client) - creates a hire
// @route   PUT /api/proposals/:id/accept
// @access  Private (client owner)
const acceptProposal = asyncHandler(async (req, res) => {
    const proposal = await Proposal.findById(req.params.id).populate('project');
    if (!proposal) {
        res.status(404);
        throw new Error('Proposal not found');
    }

    if (proposal.project.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to accept this proposal');
    }

    if (proposal.status !== 'pending') {
        res.status(400);
        throw new Error('This proposal is no longer pending');
    }

    proposal.status = 'accepted';
    proposal.clientResponse = req.body.clientResponse || 'Proposal accepted';
    await proposal.save();

    // Update project status
    proposal.project.status = 'in-progress';
    proposal.project.hiredStudent = proposal.student;
    await proposal.project.save();

    // Create hire record
    const hire = await Hire.create({
        project: proposal.project._id,
        client: req.user._id,
        student: proposal.student,
        source: 'proposal',
        sourceRef: proposal._id,
        agreedBudget: proposal.proposedBudget,
        agreedDeadline: proposal.project.deadline,
    });

    // Notify the student
    const notification = await createNotification({
        recipient: proposal.student,
        type: 'hire',
        title: 'Your proposal was accepted!',
        message: `Your proposal for "${proposal.project.title}" was accepted. You have been hired.`,
        relatedRecord: hire._id,
        relatedModel: 'Hire',
    });

    try {
        emitNotification(getIO(), proposal.student, notification);
    } catch (e) { }

    res.json({ success: true, data: { proposal, hire } });
});

// @desc    Reject a proposal (client)
// @route   PUT /api/proposals/:id/reject
// @access  Private (client owner)
const rejectProposal = asyncHandler(async (req, res) => {
    const proposal = await Proposal.findById(req.params.id).populate('project');
    if (!proposal) {
        res.status(404);
        throw new Error('Proposal not found');
    }

    if (proposal.project.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to reject this proposal');
    }

    if (proposal.status !== 'pending') {
        res.status(400);
        throw new Error('This proposal is no longer pending');
    }

    proposal.status = 'rejected';
    proposal.clientResponse = req.body.clientResponse || 'Proposal rejected';
    await proposal.save();

    // Notify the student
    const notification = await createNotification({
        recipient: proposal.student,
        type: 'proposal',
        title: 'Your proposal was not selected',
        message: `Your proposal for "${proposal.project.title}" was rejected.`,
        relatedRecord: proposal._id,
        relatedModel: 'Proposal',
    });

    try {
        emitNotification(getIO(), proposal.student, notification);
    } catch (e) { }

    res.json({ success: true, data: proposal });
});

// @desc    Withdraw a proposal (student)
// @route   PUT /api/proposals/:id/withdraw
// @access  Private (student owner)
const withdrawProposal = asyncHandler(async (req, res) => {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
        res.status(404);
        throw new Error('Proposal not found');
    }

    if (proposal.student.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to withdraw this proposal');
    }

    if (proposal.status !== 'pending') {
        res.status(400);
        throw new Error('Only pending proposals can be withdrawn');
    }

    proposal.status = 'withdrawn';
    await proposal.save();

    res.json({ success: true, data: proposal });
});

module.exports = {
    createProposal,
    getProjectProposals,
    acceptProposal,
    rejectProposal,
    withdrawProposal,
};