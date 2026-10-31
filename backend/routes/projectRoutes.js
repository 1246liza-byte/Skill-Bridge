const express = require('express');
const router = express.Router();
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    publishProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getProjects);
router.get('/:id', getProject);

// Protected client routes
router.post('/', protect, authorize('client'), createProject);
router.put('/:id', protect, authorize('client'), updateProject);
router.delete('/:id', protect, authorize('client'), deleteProject);
router.put('/:id/publish', protect, authorize('client'), publishProject);

module.exports = router;