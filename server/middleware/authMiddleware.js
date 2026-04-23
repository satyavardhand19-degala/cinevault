const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { mapAdmin } = require('../utils/mappers');

exports.protect = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, name, email, role, last_login, login_attempts, lock_until, created_at, updated_at')
      .eq('id', decoded.id)
      .single();

    if (error || !admin) {
      return res.status(401).json({ success: false, error: 'Admin no longer exists' });
    }
    req.admin = mapAdmin(admin);
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
