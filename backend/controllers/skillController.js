const Skill = require('../models/Skill');
const asyncHandler = require('../utils/asyncHandler');

const slugify = (text) =>
    text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

// @desc    Get all visible skills permit
// @route   GET /api/skills
// @access  Public
const getSkills = asyncHandler(async (req, res) => {
    const query = { visible: true };
    if (req.query.category) query.category = req.query.category;
    if (req.query.search) query.name = { $regex: req.query.search, $options: 'i' };

    const skills = await Skill.find(query).sort('name');
    res.json({ success: true, data: skills });
});

// @desc    Get all skills (admin)
// @route   GET /api/skills/all
// @access  Private (admin)
const getAllSkills = asyncHandler(async (req, res) => {
    const skills = await Skill.find().populate('category', 'name').sort('name');
    res.json({ success: true, data: skills });
});

// @desc    Create a skill
// @route   POST /api/skills
// @access  Private (admin)
const createSkill = asyncHandler(async (req, res) => {
    const { name, category } = req.body;
    if (!name) {
        res.status(400);
        throw new Error('Skill name is required');
    }

    const exists = await Skill.findOne({ name });
    if (exists) {
        res.status(400);
        throw new Error('Skill already exists');
    }

    const skill = await Skill.create({ name, slug: slugify(name), category });
    res.status(201).json({ success: true, data: skill });
});

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private (admin)
const updateSkill = asyncHandler(async (req, res) => {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
        res.status(404);
        throw new Error('Skill not found');
    }

    const fields = ['name', 'category', 'visible'];
    fields.forEach((field) => {
        if (req.body[field] !== undefined) skill[field] = req.body[field];
    });
    if (req.body.name) skill.slug = slugify(req.body.name);

    await skill.save();
    res.json({ success: true, data: skill });
});

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private (admin)
const deleteSkill = asyncHandler(async (req, res) => {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
        res.status(404);
        throw new Error('Skill not found');
    }
    await skill.remove();
    res.json({ success: true, message: 'Skill deleted' });
});

module.exports = {
    getSkills,
    getAllSkills,
    createSkill,
    updateSkill,
    deleteSkill,
};