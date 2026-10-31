const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Submit a contact message (public)
// @route   POST /api/contact
// @access  Public
const submitContact = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        res.status(400);
        throw new Error('All fields are required');
    }

    const contact = await ContactMessage.create({ name, email, subject, message });

    res.status(201).json({
        success: true,
        message: 'Your message has been sent. We will get back to you soon.',
        data: { _id: contact._id },
    });
});

// @desc    Get all contact messages (admin)
// @route   GET /api/contact
// @access  Private (admin)
const getContacts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;

    const total = await ContactMessage.countDocuments(query);
    const contacts = await ContactMessage.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        data: contacts,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});

// @desc    Update contact message status / reply (admin)
// @route   PUT /api/contact/:id
// @access  Private (admin)
const updateContact = asyncHandler(async (req, res) => {
    const contact = await ContactMessage.findById(req.params.id);
    if (!contact) {
        res.status(404);
        throw new Error('Contact message not found');
    }

    if (req.body.status) contact.status = req.body.status;
    if (req.body.adminReply !== undefined) contact.adminReply = req.body.adminReply;

    await contact.save();
    res.json({ success: true, data: contact });
});

// @desc    Delete contact message (admin)
// @route   DELETE /api/contact/:id
// @access  Private (admin)
const deleteContact = asyncHandler(async (req, res) => {
    const contact = await ContactMessage.findById(req.params.id);
    if (!contact) {
        res.status(404);
        throw new Error('Contact message not found');
    }
    await contact.remove();
    res.json({ success: true, message: 'Contact message deleted' });
});

module.exports = {
    submitContact,
    getContacts,
    updateContact,
    deleteContact,
};