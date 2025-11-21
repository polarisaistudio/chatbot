/**
 * Manual Database Migration Script
 * Adds admin_users and feedback tables
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🔄 Running database migrations...');

    // Create admin_users table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name VARCHAR(255),
        role VARCHAR(20) NOT NULL DEFAULT 'admin',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ Created admin_users table');

    // Create feedback table
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL,
        comment TEXT,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ Created feedback table');

    // Add session_id unique constraint if not exists
    const constraintExists = await sql`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'conversations'
      AND constraint_name = 'conversations_session_id_unique'
    `;

    if (constraintExists.length === 0) {
      await sql`
        ALTER TABLE conversations
        ADD CONSTRAINT conversations_session_id_unique UNIQUE (session_id)
      `;
      console.log('✅ Added unique constraint to conversations.session_id');
    }

    console.log('');
    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

migrate();
