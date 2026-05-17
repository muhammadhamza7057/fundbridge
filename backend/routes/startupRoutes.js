const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createStartup, listStartups } = require('../controllers/profileController');

const router = express.Router();

router.post('/create', authMiddleware, upload.single('pitchUpload'), createStartup);
router.get('/list', listStartups);

module.exports = router;
