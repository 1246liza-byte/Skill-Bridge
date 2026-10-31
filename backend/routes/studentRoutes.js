const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getProfile,
    updateProfile,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    getMyProposals,
    getMyOffers,
    getMyHires,
    getPublicProfile,
    getAllStudents,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllStudents);
router.get('/:id', getPublicProfile);

// Protected student routes
router.get('/dashboard/stats', protect, authorize('student'), getDashboard);
router.get('/profile/me', protect, authorize('student'), getProfile);
router.put('/profile/me', protect, authorize('student'), updateProfile);
router.post('/portfolio', protect, authorize('student'), addPortfolio);
router.put('/portfolio/:id', protect, authorize('student'), updatePortfolio);
router.delete('/portfolio/:id', protect, authorize('student'), deletePortfolio);
router.get('/proposals/mine', protect, authorize('student'), getMyProposals);
router.get('/offers/mine', protect, authorize('student'), getMyOffers);
router.get('/hires/mine', protect, authorize('student'), getMyHires);

module.exports = router;