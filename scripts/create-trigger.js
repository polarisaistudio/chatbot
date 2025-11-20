#!/usr/bin/env node

/**
 * Create trigger function for updating updated_at
 */

const { neon } = require('@neondatabase/serverless');

async function createTrigger() {
  require('dotenv').config({ path: '.env.local' });

  const sql = neon(process.env.DATABASE_URL);

  console.log('Creating trigger function...');

  try {
    // Create function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $func$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $func$ LANGUAGE plpgsql;
    `;

    console.log('✅ Trigger function created');

    // Create trigger
    await sql`
      DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
    `;

    await sql`
      CREATE TRIGGER update_documents_updated_at
        BEFORE UPDATE ON documents
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    console.log('✅ Trigger created successfully');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTrigger();
