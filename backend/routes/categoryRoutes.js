const express = require('express');
const router = express.Router();
const {
    getCategories,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getCategories);

// Admin
router.get('/all', protect, authorize('admin'), getAllCategories);
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;