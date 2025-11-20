#!/usr/bin/env node

/**
 * Database setup script
 * Run with: node scripts/setup-db.js
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  // Load environment variables
  require('dotenv').config({ path: '.env.local' });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  try {
    const sql = neon(databaseUrl);

    console.log('📝 Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'migrations', '0000_init.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔧 Executing migration...\n');

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await sql(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          // Some statements might fail if already exists, that's okay
          if (error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
          }
        }
      }
    }

    console.log('\n✅ Database setup completed successfully!\n');
    console.log('📊 Verifying tables...');

    // Verify tables were created
    const tables = await sql(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📋 Created tables:');
    tables.forEach((table) => {
      console.log(`  - ${table.table_name}`);
    });

    console.log('\n🎉 Database is ready to use!');
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
