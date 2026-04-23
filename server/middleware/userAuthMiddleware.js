const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { mapUser } = require('../utils/mappers');

exports.protect = async (req, res, next) => {
  if (!req.headers.authorization?.startsWith('Bearer'))
    return res.status(401).json({ success: false, error: 'Not authorized' });

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'user')
      return res.status(401).json({ success: false, error: 'Not authorized' });

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, created_at, updated_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) return res.status(401).json({ success: false, error: 'User not found' });

    req.user = mapUser(user);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
};
