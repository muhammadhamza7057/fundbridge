const express = require('express');
const { getUserChats, getChat, getOrCreateChat } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

const multer = require('multer');
const path = require('path');
const uploadsDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadsDir);
	},
	filename: function (req, file, cb) {
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname.replace(/\s+/g, '_')}`;
		cb(null, unique);
	},
});
const upload = multer({ storage });

// Get user's chats
router.get('/', getUserChats);

// Get unread counts by other user id
router.get('/unread-map', require('../controllers/chatController').getUnreadMap);

// Get a specific chat
router.get('/:chatId', getChat);

// Create or get chat between two users
router.post('/create', getOrCreateChat);

// Upload an attachment file for a chat (returns file url)
router.post('/:chatId/upload', upload.single('file'), (req, res, next) => {
	// simple wrapper to ensure auth middleware ran
	next();
}, require('../controllers/chatController').uploadAttachment);

module.exports = router;
