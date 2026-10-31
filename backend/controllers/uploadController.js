const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Upload an image (admin)
// @route   POST /api/upload
// @access  Private (admin)
const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const { cloudName, apiKey, apiSecret } = config.cloudinary;

    // If Cloudinary is fully configured, upload there and return the CDN URL
    if (cloudName && apiKey && apiSecret) {
        try {
            const cloudinary = require('cloudinary').v2;
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
            });

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'skillsbridge',
                resource_type: 'image',
            });

            res.status(201).json({ success: true, data: { url: result.secure_url } });
        } catch (err) {
            // Fall back to local URL if Cloudinary upload fails
            const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            res.status(201).json({ success: true, data: { url } });
        }
    } else {
        // Cloudinary not configured - serve from local /uploads
        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(201).json({ success: true, data: { url } });
    }
});

module.exports = {
    uploadImage,
};