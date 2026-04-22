const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  if (!req.headers.authorization?.startsWith('Bearer'))
    return res.status(401).json({ success: false, error: 'Not authorized' });

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'user')
      return res.status(401).json({ success: false, error: 'Not authorized' });

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) return res.status(401).json({ success: false, error: 'User not found' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
};
