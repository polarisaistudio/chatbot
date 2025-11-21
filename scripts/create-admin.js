/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.js <email> <password> [name]
 */

const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function createAdminUser() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || email.split('@')[0];

  if (!email || !password) {
    console.error('❌ Usage: node scripts/create-admin.js <email> <password> [name]');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ Password must be at least 6 characters');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🔐 Creating admin user...');

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM admin_users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      console.error(`❌ User with email ${email} already exists`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await sql`
      INSERT INTO admin_users (email, password_hash, name, role, is_active)
      VALUES (${email}, ${passwordHash}, ${name}, 'admin', true)
    `;

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log('');
    console.log('You can now login at /admin/login');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
