const User = require('../models/User');
const {
  recalculateTrustFields,
  generateVerificationCode,
} = require('../utils/trust');

function isAdmin(user) {
  return user?.role === 'admin';
}

async function saveTrust(userDoc, updates = {}) {
  const merged = {
    ...userDoc.toObject(),
    ...updates,
  };
  const recalculated = recalculateTrustFields(merged);

  userDoc.profileCompleteness = recalculated.profileCompleteness;
  userDoc.trustScore = recalculated.trustScore;
  userDoc.lastTrustUpdatedAt = new Date();

  if (updates.emailVerified !== undefined) userDoc.emailVerified = updates.emailVerified;
  if (updates.phoneVerified !== undefined) userDoc.phoneVerified = updates.phoneVerified;
  if (updates.adminApproved !== undefined) userDoc.adminApproved = updates.adminApproved;
  if (updates.adminRelationStatus !== undefined) userDoc.adminRelationStatus = updates.adminRelationStatus;
  if (updates.adminRelationNote !== undefined) userDoc.adminRelationNote = updates.adminRelationNote;
  if (updates.relatedAdminId !== undefined) userDoc.relatedAdminId = updates.relatedAdminId;
  if (updates.relatedAdminEmail !== undefined) userDoc.relatedAdminEmail = updates.relatedAdminEmail;
  if (updates.lastVerifiedByAdminAt !== undefined) userDoc.lastVerifiedByAdminAt = updates.lastVerifiedByAdminAt;
  if (updates.activityScore !== undefined) userDoc.activityScore = updates.activityScore;
  if (updates.reviewScore !== undefined) userDoc.reviewScore = updates.reviewScore;
  if (updates.emailVerificationCode !== undefined) userDoc.emailVerificationCode = updates.emailVerificationCode;
  if (updates.emailVerificationExpiresAt !== undefined) userDoc.emailVerificationExpiresAt = updates.emailVerificationExpiresAt;
  if (updates.phoneVerificationCode !== undefined) userDoc.phoneVerificationCode = updates.phoneVerificationCode;
  if (updates.phoneVerificationExpiresAt !== undefined) userDoc.phoneVerificationExpiresAt = updates.phoneVerificationExpiresAt;

  await userDoc.save();
  return userDoc;
}

exports.getMyTrust = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const trust = recalculateTrustFields(user);
    res.json({
      trust: {
        trustScore: trust.trustScore,
        profileCompleteness: trust.profileCompleteness,
        breakdown: trust.breakdown,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        adminApproved: user.adminApproved,
        adminRelationStatus: user.adminRelationStatus,
        adminRelationNote: user.adminRelationNote,
        relatedAdminEmail: user.relatedAdminEmail,
        activityScore: user.activityScore,
        reviewScore: user.reviewScore,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load trust summary', error: error.message });
  }
};

exports.recalculateMyTrust = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updated = await saveTrust(user);
    return res.json({
      message: 'Trust score recalculated',
      trustScore: updated.trustScore,
      profileCompleteness: updated.profileCompleteness,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to recalculate trust score', error: error.message });
  }
};

exports.requestEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.emailVerificationCode = code;
    user.emailVerificationExpiresAt = expiresAt;
    await user.save();

    return res.json({
      message: 'Email verification code generated',
      devCode: code,
      expiresAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to request email verification', error: error.message });
  }
};

exports.confirmEmailVerification = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.emailVerificationCode || String(user.emailVerificationCode) !== String(code)) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.emailVerificationExpiresAt && user.emailVerificationExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    user.emailVerified = true;
    user.emailVerificationCode = '';
    user.emailVerificationExpiresAt = null;
    const updated = await saveTrust(user, { emailVerified: true });

    return res.json({
      message: 'Email verified successfully',
      trustScore: updated.trustScore,
      emailVerified: updated.emailVerified,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to confirm email verification', error: error.message });
  }
};

exports.requestPhoneVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.phoneVerificationCode = code;
    user.phoneVerificationExpiresAt = expiresAt;
    await user.save();

    return res.json({
      message: 'Phone verification code generated',
      devCode: code,
      expiresAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to request phone verification', error: error.message });
  }
};

exports.confirmPhoneVerification = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.phoneVerificationCode || String(user.phoneVerificationCode) !== String(code)) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.phoneVerificationExpiresAt && user.phoneVerificationExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    user.phoneVerified = true;
    user.phoneVerificationCode = '';
    user.phoneVerificationExpiresAt = null;
    const updated = await saveTrust(user, { phoneVerified: true });

    return res.json({
      message: 'Phone verified successfully',
      trustScore: updated.trustScore,
      phoneVerified: updated.phoneVerified,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to confirm phone verification', error: error.message });
  }
};

exports.adminApproveUser = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Admin approval is restricted to admins' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updated = await saveTrust(user, { adminApproved: true });
    return res.json({
      message: 'User approved by admin',
      user: {
        id: updated._id,
        email: updated.email,
        role: updated.role,
        adminApproved: updated.adminApproved,
        adminRelationStatus: updated.adminRelationStatus,
        adminRelationStatus: updated.adminRelationStatus,
        trustScore: updated.trustScore,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve user', error: error.message });
  }
};

exports.updateTrustMetrics = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Only admins can update trust metrics' });
    }

    const { userId, activityScore, reviewScore } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updated = await saveTrust(user, {
      activityScore: activityScore !== undefined ? activityScore : user.activityScore,
      reviewScore: reviewScore !== undefined ? reviewScore : user.reviewScore,
    });

    return res.json({
      message: 'Trust metrics updated',
      trustScore: updated.trustScore,
      profileCompleteness: updated.profileCompleteness,
      activityScore: updated.activityScore,
      reviewScore: updated.reviewScore,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update trust metrics', error: error.message });
  }
};

exports.adminSetEmailVerified = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ message: 'Admin only' });
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const updated = await saveTrust(user, { emailVerified: true });
    return res.json({ message: 'Email marked verified', user: { id: updated._id, email: updated.email, emailVerified: updated.emailVerified, trustScore: updated.trustScore } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to set email verified', error: error.message });
  }
};

exports.adminSetPhoneVerified = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ message: 'Admin only' });
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const updated = await saveTrust(user, { phoneVerified: true });
    return res.json({ message: 'Phone marked verified', user: { id: updated._id, email: updated.email, phoneVerified: updated.phoneVerified, trustScore: updated.trustScore } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to set phone verified', error: error.message });
  }
};

exports.adminRequestEmailVerification = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ message: 'Admin only' });

    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.emailVerificationCode = code;
    user.emailVerificationExpiresAt = expiresAt;
    await user.save();

    return res.json({
      message: 'Verification email prepared',
      devCode: code,
      expiresAt,
      user: {
        id: user._id,
        email: user.email,
        emailVerified: user.emailVerified,
        emailVerificationExpiresAt: user.emailVerificationExpiresAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send verification email', error: error.message });
  }
};

function buildAdminEmailTemplate(template, user, reason = '') {
  const displayName = user.name || user.email;

  if (template === 'verified') {
    return {
      subject: 'Your FundBridge account is verified',
      message: `Hello ${displayName}, your account has been verified by the FundBridge admin team. You can continue using the platform normally.`,
    };
  }

  if (template === 'rejected') {
    return {
      subject: 'FundBridge account review update',
      message: `Hello ${displayName}, your account was not approved at this time. ${reason || 'Please review the required information and try again.'}`,
    };
  }

  if (template === 'pending') {
    return {
      subject: 'Additional information required for FundBridge',
      message: `Hello ${displayName}, your account is not verified yet because some details are still pending. ${reason || 'Please complete the missing information or respond to the pending queries.'}`,
    };
  }

  if (template === 'notification') {
    return {
      subject: 'Your FundBridge verification is pending review',
      message: `Hello ${displayName}, your verification is pending review. ${reason || 'We will update you once the admin team confirms your details.'}`,
    };
  }

  return {
    subject: 'FundBridge account update',
    message: `Hello ${displayName}, there is an update regarding your account. ${reason || ''}`.trim(),
  };
}

exports.adminSendEmailNotice = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ message: 'Admin only' });

    const { userId } = req.params;
    const { template = 'pending', reason = '' } = req.body || {};

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const emailContent = buildAdminEmailTemplate(template, user, reason);

    user.lastAdminEmailTemplate = template;
    user.lastAdminEmailReason = reason;
    user.lastAdminEmailSubject = emailContent.subject;
    user.lastAdminEmailMessage = emailContent.message;
    user.lastAdminEmailAt = new Date();
    await user.save();

    return res.json({
      message: 'Admin email prepared and stored',
      template,
      reason,
      subject: emailContent.subject,
      body: emailContent.message,
      user: {
        id: user._id,
        email: user.email,
        lastAdminEmailTemplate: user.lastAdminEmailTemplate,
        lastAdminEmailAt: user.lastAdminEmailAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send admin email', error: error.message });
  }
};

exports.adminSendVerificationNotification = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ message: 'Admin only' });

    const { userId } = req.params;
    const { reason = '' } = req.body || {};

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const subject = 'Your FundBridge verification is pending review';
    const message = `Hello ${user.name || user.email}, your verification is still pending. ${reason || 'We will review your profile and notify you once it is verified.'}`;

    user.lastAdminEmailTemplate = 'notification';
    user.lastAdminEmailReason = reason;
    user.lastAdminEmailSubject = subject;
    user.lastAdminEmailMessage = message;
    user.lastAdminEmailAt = new Date();
    await user.save();

    return res.json({
      message: 'Verification notification stored',
      subject,
      body: message,
      user: {
        id: user._id,
        email: user.email,
        lastAdminEmailTemplate: user.lastAdminEmailTemplate,
        lastAdminEmailAt: user.lastAdminEmailAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send verification notification', error: error.message });
  }
};

exports.adminSetRelationStatus = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ message: 'Admin only' });

    const { userId } = req.params;
    const { status = 'verified', note = '' } = req.body || {};

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const normalizedStatus = ['pending', 'verified', 'rejected'].includes(status) ? status : 'pending';
    const updated = await saveTrust(user, {
      adminRelationStatus: normalizedStatus,
      adminRelationNote: note,
      relatedAdminId: req.user._id.toString(),
      relatedAdminEmail: req.user.email,
      lastVerifiedByAdminAt: normalizedStatus === 'verified' ? new Date() : null,
    });

    return res.json({
      message: 'Admin relation updated',
      user: {
        id: updated._id,
        email: updated.email,
        adminRelationStatus: updated.adminRelationStatus,
        adminRelationNote: updated.adminRelationNote,
        relatedAdminEmail: updated.relatedAdminEmail,
        trustScore: updated.trustScore,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update admin relation', error: error.message });
  }
};
