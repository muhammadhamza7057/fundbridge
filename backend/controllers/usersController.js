const User = require('../models/User');

const userListProjection = 'name email role avatar trustScore profileCompleteness emailVerified phoneVerified adminApproved adminRelationStatus adminRelationNote relatedAdminEmail lastVerifiedByAdminAt lastAdminEmailTemplate lastAdminEmailSubject lastAdminEmailReason lastAdminEmailAt';

// Get other users (optionally filter by role)
exports.listOtherUsers = async (req, res) => {
  try {
    const currentUser = req.user; // set by authMiddleware
    const role = req.query.role; // optional: filter by role

    const query = { _id: { $ne: currentUser._id } };
    if (role) query.role = role;

    const users = await User.find(query).select(userListProjection);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listAdminUsers = async (req, res) => {
  try {
    const role = req.query.role;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query).select(userListProjection);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
