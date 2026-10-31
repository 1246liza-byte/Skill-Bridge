const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all published projects (public)
// @route   GET /api/projects
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const { search, category, budgetMin, budgetMax, skill, deadline, sort } = req.query;

    const query = { status: 'open', visibility: 'public' };

    if (search) {
        query.$text = { $search: search };
    }
    if (category) {
        query.category = category;
    }
    if (skill) {
        query.requiredSkills = { $in: [skill] };
    }
    if (budgetMin || budgetMax) {
        query.budget = {};
        if (budgetMin) query.budget.$gte = parseInt(budgetMin);
        if (budgetMax) query.budget.$lte = parseInt(budgetMax);
    }
    if (deadline) {
        query.deadline = { $lte: new Date(deadline) };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'budget') sortOption = { budget: -1 };
    if (sort === 'deadline') sortOption = { deadline: 1 };

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
        .populate('owner', 'name profileImage companyName')
        .populate('category', 'name')
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        data: projects,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('owner', 'name profileImage companyName')
        .populate('category', 'name');

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Increment views
    project.views += 1;
    await project.save();

    res.json({ success: true, data: project });
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (client)
const createProject = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        category,
        requiredSkills,
        budgetType,
        budget,
        budgetMin,
        budgetMax,
        deadline,
        projectType,
        status,
        visibility,
    } = req.body;

    if (!title || !description || !category) {
        res.status(400);
        throw new Error('Title, description and category are required');
    }

    const project = await Project.create({
        owner: req.user._id,
        title,
        description,
        category,
        requiredSkills: requiredSkills || [],
        budgetType: budgetType || 'fixed',
        budget: budget || 0,
        budgetMin: budgetMin || 0,
        budgetMax: budgetMax || 0,
        deadline,
        projectType: projectType || 'one-time',
        status: status || 'draft',
        visibility: visibility || 'public',
    });

    res.status(201).json({ success: true, data: project });
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (client owner)
const updateProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this project');
    }

    const fields = [
        'title',
        'description',
        'category',
        'requiredSkills',
        'budgetType',
        'budget',
        'budgetMin',
        'budgetMax',
        'deadline',
        'projectType',
        'status',
        'visibility',
    ];

    fields.forEach((field) => {
        if (req.body[field] !== undefined) {
            project[field] = req.body[field];
        }
    });

    await project.save();
    res.json({ success: true, data: project });
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (client owner)
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this project');
    }

    // Delete related proposals
    await Proposal.deleteMany({ project: project._id });

    await project.remove();
    res.json({ success: true, message: 'Project deleted' });
});

// @desc    Publish a draft project
// @route   PUT /api/projects/:id/publish
// @access  Private (client owner)
const publishProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to publish this project');
    }

    project.status = 'open';
    await project.save();
    res.json({ success: true, data: project });
});

module.exports = {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    publishProject,
};