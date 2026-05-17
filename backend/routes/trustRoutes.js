const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getMyTrust,
  recalculateMyTrust,
  requestEmailVerification,
  confirmEmailVerification,
  requestPhoneVerification,
  confirmPhoneVerification,
  adminApproveUser,
  updateTrustMetrics,
  adminSetEmailVerified,
  adminSetPhoneVerified,
  adminRequestEmailVerification,
  adminSendEmailNotice,
  adminSendVerificationNotification,
  adminSetRelationStatus,
} = require('../controllers/trustController');

const router = express.Router();

router.use(authMiddleware);

router.get('/me', getMyTrust);
router.post('/me/recalculate', recalculateMyTrust);
router.post('/me/email/request', requestEmailVerification);
router.post('/me/email/confirm', confirmEmailVerification);
router.post('/me/phone/request', requestPhoneVerification);
router.post('/me/phone/confirm', confirmPhoneVerification);
const adminMiddleware = require('../middleware/adminMiddleware');

router.patch('/admin/approve/:userId', adminMiddleware, adminApproveUser);
router.patch('/admin/metrics', adminMiddleware, updateTrustMetrics);
router.post('/admin/email/request/:userId', adminMiddleware, adminRequestEmailVerification);
router.post('/admin/email/send/:userId', adminMiddleware, adminSendEmailNotice);
router.post('/admin/email/notify/:userId', adminMiddleware, adminSendVerificationNotification);
router.patch('/admin/email/verify/:userId', adminMiddleware, adminSetEmailVerified);
router.patch('/admin/phone/verify/:userId', adminMiddleware, adminSetPhoneVerified);
router.patch('/admin/relation/:userId', adminMiddleware, adminSetRelationStatus);

module.exports = router;
