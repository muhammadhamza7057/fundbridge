const express = require('express');
const { listOtherUsers, listAdminUsers } = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();
router.use(authMiddleware);

// GET /api/users?role=investor (authenticated users for chat/community)
router.get('/', listOtherUsers);

// GET /api/users/admin?role=investor (admin only)
router.get('/admin', adminMiddleware, listAdminUsers);

module.exports = router;
