const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createInvestor, listInvestors } = require('../controllers/profileController');

const router = express.Router();

router.post('/create', authMiddleware, createInvestor);
router.get('/list', listInvestors);

module.exports = router;
