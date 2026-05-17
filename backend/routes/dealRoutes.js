const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const dealController = require('../controllers/dealController');

// protect routes
router.use(authMiddleware);

// Create a deal
router.post('/create', dealController.createDeal);

// Update a deal (partial)
// Accept both /update/:id and /update (id in body) for compatibility
router.patch('/update/:id', dealController.updateDeal);
router.patch('/update', (req, res, next) => {
	// expect { id, ...updates } in body
	const { id, ...updates } = req.body || {};
	if (!id) return res.status(400).json({ message: 'id is required in body' });
	req.params.id = id;
	req.body = updates;
	return dealController.updateDeal(req, res, next);
});

// Get deal by id
router.get('/:id', dealController.getDeal);
// List deals for current user
router.get('/', dealController.listDealsForUser);

module.exports = router;
