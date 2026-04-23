const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !admin) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (admin.lock_until && new Date(admin.lock_until) > new Date()) {
      return res.status(403).json({ success: false, error: 'Account is locked. Try again later.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      const newAttempts = admin.login_attempts + 1;
      const updates = { login_attempts: newAttempts };
      if (newAttempts >= 5) {
        updates.lock_until = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      }
      await supabase.from('admins').update(updates).eq('id', admin.id);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    await supabase.from('admins').update({
      login_attempts: 0,
      lock_until: null,
      last_login: new Date().toISOString()
    }).eq('id', admin.id);

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        admin: { _id: admin.id, name: admin.name, email: admin.email, role: admin.role },
        expiresIn: 86400
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
