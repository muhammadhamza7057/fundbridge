const express = require('express');
const { register, login, me, firebaseAuth } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/firebase', firebaseAuth);
router.post('/google', firebaseAuth);
router.get('/me', authMiddleware, me);

module.exports = router;