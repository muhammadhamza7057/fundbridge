const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createInvestor } = require('../controllers/profileController');

const router = express.Router();

router.post('/create', authMiddleware, createInvestor);

module.exports = router;
