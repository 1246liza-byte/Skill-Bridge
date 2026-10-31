const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getProfile,
    updateProfile,
    saveStudent,
    getSavedStudents,
    getMyProjects,
    getProjectProposals,
    getMyOffers,
    getMyHires,
} = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');

// Protected client routes
router.get('/dashboard/stats', protect, authorize('client'), getDashboard);
router.get('/profile/me', protect, authorize('client'), getProfile);
router.put('/profile/me', protect, authorize('client'), updateProfile);
router.put('/save-student/:id', protect, authorize('client'), saveStudent);
router.get('/saved-students', protect, authorize('client'), getSavedStudents);
router.get('/projects/mine', protect, authorize('client'), getMyProjects);
router.get('/projects/:id/proposals', protect, authorize('client'), getProjectProposals);
router.get('/offers/mine', protect, authorize('client'), getMyOffers);
router.get('/hires/mine', protect, authorize('client'), getMyHires);

module.exports = router;