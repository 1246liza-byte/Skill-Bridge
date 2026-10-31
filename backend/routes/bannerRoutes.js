const express = require('express');
const router = express.Router();
const {
    getBanners,
    getAllBanners,
    createBanner,
    updateBanner,
    reorderBanners,
    deleteBanner,
} = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getBanners);

// Admin
router.get('/all', protect, authorize('admin'), getAllBanners);
router.post('/', protect, authorize('admin'), createBanner);
router.put('/reorder', protect, authorize('admin'), reorderBanners);
router.put('/:id', protect, authorize('admin'), updateBanner);
router.delete('/:id', protect, authorize('admin'), deleteBanner);

module.exports = router;