const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getUsers,
    getUser,
    updateUser,
    suspendUser,
    restoreUser,
    deleteUser,
    getProjects,
    updateProject,
    deleteProject,
    getProposals,
    getHires,
    getAuditLogs,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/restore', restoreUser);
router.delete('/users/:id', deleteUser);
router.get('/projects', getProjects);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);
router.get('/proposals', getProposals);
router.get('/hires', getHires);
router.get('/audit-logs', getAuditLogs);

module.exports = router;