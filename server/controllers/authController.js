const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (admin.lockUntil && admin.lockUntil > Date.now()) {
      return res.status(403).json({ success: false, error: 'Account is locked. Try again later.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      admin.loginAttempts += 1;
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = Date.now() + 10 * 60 * 1000; // 10 minutes
      }
      await admin.save();
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Reset login attempts
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLogin = Date.now();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
        expiresIn: 86400
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Admin logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
