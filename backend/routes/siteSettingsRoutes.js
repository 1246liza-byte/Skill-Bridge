const express = require('express');
const router = express.Router();
const {
    getSettings,
    getSetting,
    updateSetting,
    updateSettings,
} = require('../controllers/siteSettingsController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getSettings);
router.get('/:key', getSetting);

// Admin
router.put('/', protect, authorize('admin'), updateSettings);
router.put('/:key', protect, authorize('admin'), updateSetting);

module.exports = router;