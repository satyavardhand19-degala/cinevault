require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const ADMIN_EMAIL = 'admin12@gmail.com';
const ADMIN_PASSWORD = 'admin@123';

const reset = async () => {
  try {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const { data, error } = await supabase
      .from('admins')
      .upsert(
        {
          name: 'Admin User',
          email: ADMIN_EMAIL,
          password_hash: passwordHash,
          role: 'admin',
          login_attempts: 0,
          lock_until: null
        },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (error) throw error;
    console.log(`Admin reset successfully: ${data.email}`);
    console.log(`Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

reset();
