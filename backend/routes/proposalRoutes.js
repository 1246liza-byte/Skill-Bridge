const express = require('express');
const router = express.Router();
const {
    createProposal,
    getProjectProposals,
    acceptProposal,
    rejectProposal,
    withdrawProposal,
} = require('../controllers/proposalController');
const { protect, authorize } = require('../middleware/auth');

// Student submits proposal
router.post('/', protect, authorize('student'), createProposal);

// Client views proposals for a project
router.get('/project/:projectId', protect, authorize('client'), getProjectProposals);

// Client accepts/rejects
router.put('/:id/accept', protect, authorize('client'), acceptProposal);
router.put('/:id/reject', protect, authorize('client'), rejectProposal);

// Student withdraws
router.put('/:id/withdraw', protect, authorize('student'), withdrawProposal);

module.exports = router;