const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createStartup } = require('../controllers/profileController');

const router = express.Router();

router.post('/create', authMiddleware, upload.single('pitchUpload'), createStartup);

module.exports = router;
