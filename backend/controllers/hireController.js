const Hire = require('../models/Hire');
const Project = require('../models/Project');
const StudentProfile = require('../models/StudentProfile');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification, emitNotification } = require('../services/notificationService');
const { getIO } = require('../sockets');

// @desc    Get a single hire
// @route   GET /api/hires/:id
// @access  Private (participant)
const getHire = asyncHandler(async (req, res) => {
    const hire = await Hire.findById(req.params.id)
        .populate('client', 'name profileImage companyName')
        .populate('student', 'name profileImage')
        .populate('project', 'title description');

    if (!hire) {
        res.status(404);
        throw new Error('Hire not found');
    }

    const isParticipant =
        hire.client.toString() === req.user._id.toString() ||
        hire.student.toString() === req.user._id.toString() ||
        req.user.role === 'admin';

    if (!isParticipant) {
        res.status(403);
        throw new Error('Not authorized to view this hire');
    }

    res.json({ success: true, data: hire });
});

// @desc    Mark a hire as completed
// @route   PUT /api/hires/:id/complete
// @access  Private (client)
const completeHire = asyncHandler(async (req, res) => {
    const hire = await Hire.findById(req.params.id).populate('project');
    if (!hire) {
        res.status(404);
        throw new Error('Hire not found');
    }

    if (hire.client.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to complete this hire');
    }

    if (hire.status !== 'active') {
        res.status(400);
        throw new Error('Only active hires can be completed');
    }

    hire.status = 'completed';
    hire.completedAt = Date.now();
    await hire.save();

    // Update project status
    hire.project.status = 'completed';
    await hire.project.save();

    // Increment student's completed projects count
    const studentProfile = await StudentProfile.findOne({ user: hire.student });
    if (studentProfile) {
        studentProfile.completedProjects += 1;
        await studentProfile.save();
    }

    // Notify the student
    const notification = await createNotification({
        recipient: hire.student,
        type: 'hire',
        title: 'Project completed!',
        message: `The project "${hire.project.title}" has been marked as completed.`,
        relatedRecord: hire._id,
        relatedModel: 'Hire',
    });

    try {
        emitNotification(getIO(), hire.student, notification);
    } catch (e) { }

    res.json({ success: true, data: hire });
});

// @desc    Cancel a hire
// @route   PUT /api/hires/:id/cancel
// @access  Private (participant)
const cancelHire = asyncHandler(async (req, res) => {
    const hire = await Hire.findById(req.params.id).populate('project');
    if (!hire) {
        res.status(404);
        throw new Error('Hire not found');
    }

    const isParticipant =
        hire.client.toString() === req.user._id.toString() ||
        hire.student.toString() === req.user._id.toString();

    if (!isParticipant) {
        res.status(403);
        throw new Error('Not authorized to cancel this hire');
    }

    if (hire.status !== 'active') {
        res.status(400);
        throw new Error('Only active hires can be cancelled');
    }

    hire.status = 'cancelled';
    hire.cancelledAt = Date.now();
    hire.cancellationReason = req.body.reason || 'No reason provided';
    await hire.save();

    // Update project status back to open
    hire.project.status = 'open';
    hire.project.hiredStudent = null;
    await hire.project.save();

    // Notify the other party
    const otherParty =
        req.user._id.toString() === hire.client.toString() ? hire.student : hire.client;
    const notification = await createNotification({
        recipient: otherParty,
        type: 'hire',
        title: 'Hire cancelled',
        message: `The hire for "${hire.project.title}" has been cancelled.`,
        relatedRecord: hire._id,
        relatedModel: 'Hire',
    });

    try {
        emitNotification(getIO(), otherParty, notification);
    } catch (e) { }

    res.json({ success: true, data: hire });
});

module.exports = {
    getHire,
    completeHire,
    cancelHire,
};