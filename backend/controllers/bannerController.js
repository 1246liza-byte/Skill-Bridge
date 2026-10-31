const Banner = require('../models/Banner');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get published banners (public)
// @route   GET /api/banners
// @access  Public
const getBanners = asyncHandler(async (req, res) => {
    const banners = await Banner.find({ published: true }).sort('order -createdAt');
    res.json({ success: true, data: banners });
});

// @desc    Get all banners (admin)
// @route   GET /api/banners/all
// @access  Private (admin)
const getAllBanners = asyncHandler(async (req, res) => {
    const banners = await Banner.find().sort('order -createdAt');
    res.json({ success: true, data: banners });
});

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private (admin)
const createBanner = asyncHandler(async (req, res) => {
    const { title, description, image, link, order, published } = req.body;
    if (!title) {
        res.status(400);
        throw new Error('Banner title is required');
    }

    const banner = await Banner.create({
        title,
        description,
        image,
        link,
        order,
        published,
    });

    res.status(201).json({ success: true, data: banner });
});

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private (admin)
const updateBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
        res.status(404);
        throw new Error('Banner not found');
    }

    const fields = ['title', 'description', 'image', 'link', 'order', 'published'];
    fields.forEach((field) => {
        if (req.body[field] !== undefined) banner[field] = req.body[field];
    });

    await banner.save();
    res.json({ success: true, data: banner });
});

// @desc    Reorder banners
// @route   PUT /api/banners/reorder
// @access  Private (admin)
const reorderBanners = asyncHandler(async (req, res) => {
    const { order } = req.body; // array of { id, order }
    if (!Array.isArray(order)) {
        res.status(400);
        throw new Error('Order array is required');
    }

    await Promise.all(
        order.map((item) =>
            Banner.findByIdAndUpdate(item.id, { order: item.order })
        )
    );

    const banners = await Banner.find().sort('order');
    res.json({ success: true, data: banners });
});

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private (admin)
const deleteBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
        res.status(404);
        throw new Error('Banner not found');
    }
    await banner.remove();
    res.json({ success: true, message: 'Banner deleted' });
});

module.exports = {
    getBanners,
    getAllBanners,
    createBanner,
    updateBanner,
    reorderBanners,
    deleteBanner,
};