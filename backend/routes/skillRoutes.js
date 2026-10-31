const express = require('express');
const router = express.Router();
const {
    getSkills,
    getAllSkills,
    createSkill,
    updateSkill,
    deleteSkill,
} = require('../controllers/skillController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getSkills);

// Admin
router.get('/all', protect, authorize('admin'), getAllSkills);
router.post('/', protect, authorize('admin'), createSkill);
router.put('/:id', protect, authorize('admin'), updateSkill);
router.delete('/:id', protect, authorize('admin'), deleteSkill);

module.exports = router;