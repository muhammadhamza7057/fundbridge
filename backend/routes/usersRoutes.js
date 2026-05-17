const express = require('express');
const { listOtherUsers } = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);
const adminMiddleware = require('../middleware/adminMiddleware');

// GET /api/users?role=investor (admin only)
router.get('/', adminMiddleware, listOtherUsers);

module.exports = router;
