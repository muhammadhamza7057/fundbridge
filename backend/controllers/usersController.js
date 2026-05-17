const User = require('../models/User');

// Get other users (optionally filter by role)
exports.listOtherUsers = async (req, res) => {
  try {
    const currentUser = req.user; // set by authMiddleware
    const role = req.query.role; // optional: filter by role

    const query = { _id: { $ne: currentUser._id } };
    if (role) query.role = role;

    const users = await User.find(query).select('name email role avatar trustScore profileCompleteness emailVerified phoneVerified adminApproved adminRelationStatus adminRelationNote relatedAdminEmail lastVerifiedByAdminAt lastAdminEmailTemplate lastAdminEmailSubject lastAdminEmailReason lastAdminEmailAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
