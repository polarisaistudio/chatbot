/**
 * Reset Admin User Password Script
 * Updates the password for an existing admin user
 */

const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function resetAdminPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('❌ Usage: node scripts/reset-admin-password.js <email> <new-password>');
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error('❌ Password must be at least 6 characters');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log(`🔐 Resetting password for: ${email}...`);

    // Check if user exists
    const users = await sql`
      SELECT id, email FROM admin_users WHERE email = ${email}
    `;

    if (users.length === 0) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await sql`
      UPDATE admin_users
      SET password_hash = ${passwordHash}, updated_at = NOW()
      WHERE email = ${email}
    `;

    console.log('✅ Password reset successfully!');
    console.log(`\nYou can now login with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
