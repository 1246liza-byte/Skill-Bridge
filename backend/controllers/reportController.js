const Report = require('../models/Report');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Submit a report (authenticated user)
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
    const { reportType, targetUser, targetProject, targetMessage, reason } = req.body;

    if (!reportType || !reason) {
        res.status(400);
        throw new Error('Report type and reason are required');
    }

    const report = await Report.create({
        reporter: req.user._id,
        reportType,
        targetUser,
        targetProject,
        targetMessage,
        reason,
    });

    res.status(201).json({ success: true, data: report });
});

// @desc    Get all reports (admin)
// @route   GET /api/reports
// @access  Private (admin)
const getReports = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.reportType) query.reportType = req.query.reportType;

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
        .populate('reporter', 'name email')
        .populate('targetUser', 'name email')
        .populate('targetProject', 'title')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        data: reports,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

// @desc    Update report status (admin)
// @route   PUT /api/reports/:id
// @access  Private (admin)
const updateReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    if (req.body.status) report.status = req.body.status;
    if (req.body.adminNote !== undefined) report.adminNote = req.body.adminNote;

    if (req.body.status === 'resolved' || req.body.status === 'dismissed') {
        report.resolvedBy = req.user._id;
        report.resolvedAt = Date.now();
    }

    await report.save();
    res.json({ success: true, data: report });
});

// @desc    Delete a report (admin)
// @route   DELETE /api/reports/:id
// @access  Private (admin)
const deleteReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }
    await report.remove();
    res.json({ success: true, message: 'Report deleted' });
});

module.exports = {
    createReport,
    getReports,
    updateReport,
    deleteReport,
};