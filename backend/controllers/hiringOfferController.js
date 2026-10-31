const HiringOffer = require('../models/HiringOffer');
const Project = require('../models/Project');
const User = require('../models/User');
const Hire = require('../models/Hire');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification, emitNotification } = require('../services/notificationService');
const { getIO } = require('../sockets');

// @desc    Send a hiring offer (client)
// @route   POST /api/hiring-offers
// @access  Private (client)
const createOffer = asyncHandler(async (req, res) => {
    const { student, project, budget, deadline, message } = req.body;

    if (!student || !project || !budget) {
        res.status(400);
        throw new Error('Student, project and budget are required');
    }

    const studentDoc = await User.findById(student);
    if (!studentDoc || studentDoc.role !== 'student') {
        res.status(404);
        throw new Error('Student not found');
    }

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (projectDoc.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to send offers for this project');
    }

    // Check for existing pending offer
    const existing = await HiringOffer.findOne({
        client: req.user._id,
        student,
        project,
        status: 'pending',
    });
    if (existing) {
        res.status(400);
        throw new Error('A pending offer already exists for this student and project');
    }

    const offer = await HiringOffer.create({
        client: req.user._id,
        student,
        project,
        budget,
        deadline,
        message,
    });

    // Notify the student
    const notification = await createNotification({
        recipient: student,
        type: 'offer',
        title: 'You received a hiring offer!',
        message: `${req.user.name} sent you a hiring offer for "${projectDoc.title}"`,
        relatedRecord: offer._id,
        relatedModel: 'HiringOffer',
    });

    try {
        emitNotification(getIO(), student, notification);
    } catch (e) { }

    res.status(201).json({ success: true, data: offer });
});

// @desc    Accept a hiring offer (student) - creates a hire
// @route   PUT /api/hiring-offers/:id/accept
// @access  Private (student)
const acceptOffer = asyncHandler(async (req, res) => {
    const offer = await HiringOffer.findById(req.params.id).populate('project');
    if (!offer) {
        res.status(404);
        throw new Error('Offer not found');
    }

    if (offer.student.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to accept this offer');
    }

    if (offer.status !== 'pending') {
        res.status(400);
        throw new Error('This offer is no longer pending');
    }

    offer.status = 'accepted';
    offer.decisionDate = Date.now();
    await offer.save();

    // Update project status
    offer.project.status = 'in-progress';
    offer.project.hiredStudent = offer.student;
    await offer.project.save();

    // Create hire record
    const hire = await Hire.create({
        project: offer.project._id,
        client: offer.client,
        student: offer.student,
        source: 'offer',
        sourceRef: offer._id,
        agreedBudget: offer.budget,
        agreedDeadline: offer.deadline,
    });

    // Notify the client
    const notification = await createNotification({
        recipient: offer.client,
        type: 'hire',
        title: 'Your hiring offer was accepted!',
        message: `${req.user.name} accepted your offer for "${offer.project.title}".`,
        relatedRecord: hire._id,
        relatedModel: 'Hire',
    });

    try {
        emitNotification(getIO(), offer.client, notification);
    } catch (e) { }

    res.json({ success: true, data: { offer, hire } });
});

// @desc    Reject a hiring offer (student)
// @route   PUT /api/hiring-offers/:id/reject
// @access  Private (student)
const rejectOffer = asyncHandler(async (req, res) => {
    const offer = await HiringOffer.findById(req.params.id).populate('project');
    if (!offer) {
        res.status(404);
        throw new Error('Offer not found');
    }

    if (offer.student.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to reject this offer');
    }

    if (offer.status !== 'pending') {
        res.status(400);
        throw new Error('This offer is no longer pending');
    }

    offer.status = 'rejected';
    offer.decisionDate = Date.now();
    await offer.save();

    // Notify the client
    const notification = await createNotification({
        recipient: offer.client,
        type: 'offer',
        title: 'Your hiring offer was rejected',
        message: `${req.user.name} declined your offer for "${offer.project.title}".`,
        relatedRecord: offer._id,
        relatedModel: 'HiringOffer',
    });

    try {
        emitNotification(getIO(), offer.client, notification);
    } catch (e) { }

    res.json({ success: true, data: offer });
});

// @desc    Withdraw a hiring offer (client)
// @route   PUT /api/hiring-offers/:id/withdraw
// @access  Private (client)
const withdrawOffer = asyncHandler(async (req, res) => {
    const offer = await HiringOffer.findById(req.params.id);
    if (!offer) {
        res.status(404);
        throw new Error('Offer not found');
    }

    if (offer.client.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to withdraw this offer');
    }

    if (offer.status !== 'pending') {
        res.status(400);
        throw new Error('Only pending offers can be withdrawn');
    }

    offer.status = 'withdrawn';
    await offer.save();

    res.json({ success: true, data: offer });
});

module.exports = {
    createOffer,
    acceptOffer,
    rejectOffer,
    withdrawOffer,
};