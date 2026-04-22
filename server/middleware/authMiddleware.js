const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-passwordHash');
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Admin no longer exists' });
    }
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Not authorized, token failed' });
  }
};

exports.admin = (req, res, next) => {
  if (req.admin && (req.admin.role === 'admin' || req.admin.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Not authorized as an admin' });
  }
};
