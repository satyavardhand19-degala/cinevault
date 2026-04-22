require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const ADMIN_EMAIL = 'admin12@gmail.com';
const ADMIN_PASSWORD = 'admin@123';

const reset = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB...');

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await Admin.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      {
        name: 'Admin User',
        email: ADMIN_EMAIL,
        passwordHash,
        role: 'admin',
        loginAttempts: 0,
        lockUntil: undefined
      },
      { upsert: true, returnDocument: 'after' }
    );

    console.log(`Admin reset successfully: ${admin.email}`);
    console.log(`Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

reset();
