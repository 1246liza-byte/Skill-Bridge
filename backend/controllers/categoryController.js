const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');

const slugify = (text) =>
    text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

// @desc    Get all visible categories (public)
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const query = {};
    if (req.query.visible === 'true') query.visible = true;
    if (req.query.featured === 'true') query.featured = true;

    const categories = await Category.find(query).sort('order name');
    res.json({ success: true, data: categories });
});

// @desc    Get all categories (admin)
// @route   GET /api/categories/all
// @access  Private (admin)
const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort('order name');
    res.json({ success: true, data: categories });
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (admin)
const createCategory = asyncHandler(async (req, res) => {
    const { name, description, icon, featured, visible, order } = req.body;
    if (!name) {
        res.status(400);
        throw new Error('Category name is required');
    }

    const exists = await Category.findOne({ name });
    if (exists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await Category.create({
        name,
        slug: slugify(name),
        description,
        icon,
        featured,
        visible,
        order,
    });

    res.status(201).json({ success: true, data: category });
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (admin)
const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    const fields = ['name', 'description', 'icon', 'featured', 'visible', 'order'];
    fields.forEach((field) => {
        if (req.body[field] !== undefined) category[field] = req.body[field];
    });
    if (req.body.name) category.slug = slugify(req.body.name);

    await category.save();
    res.json({ success: true, data: category });
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (admin)
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }
    await category.remove();
    res.json({ success: true, message: 'Category deleted' });
});

module.exports = {
    getCategories,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};