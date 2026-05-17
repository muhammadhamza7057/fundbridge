module.exports = function adminMiddleware(req, res, next) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    if (user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
