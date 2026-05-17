const express = require('express');
const { listOtherUsers } = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

// GET /api/users?role=investor
router.get('/', listOtherUsers);

module.exports = router;
