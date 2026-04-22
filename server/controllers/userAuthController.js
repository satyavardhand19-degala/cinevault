const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signToken = (id) =>
  jwt.sign({ id, type: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      data: { token, user: { _id: user._id, name: user.name, email: user.email } }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ success: false, error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ success: false, error: 'Invalid email or password' });

    const token = signToken(user._id);
    res.status(200).json({
      success: true,
      data: { token, user: { _id: user._id, name: user.name, email: user.email } }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};
