const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createStartup, listStartups, getStartup } = require('../controllers/profileController');

const router = express.Router();

router.post('/create', authMiddleware, upload.fields([
	{ name: 'pitchUpload', maxCount: 1 },
	{ name: 'coverUpload', maxCount: 1 },
]), createStartup);
router.get('/list', listStartups);
router.get('/:id', getStartup);

module.exports = router;
