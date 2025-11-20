#!/usr/bin/env node

/**
 * Test database connection and basic operations
 */

const { neon } = require('@neondatabase/serverless');

async function testDatabase() {
  console.log('🧪 Testing database connection...\n');

  require('dotenv').config({ path: '.env.local' });

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Test 1: Basic query
    console.log('Test 1: Basic connection');
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connected! Current time:', result[0].current_time);

    // Test 2: Check extensions
    console.log('\nTest 2: Check extensions');
    const extensions = await sql`
      SELECT extname, extversion
      FROM pg_extension
      WHERE extname IN ('uuid-ossp', 'vector')
      ORDER BY extname;
    `;
    console.log('✅ Extensions installed:');
    extensions.forEach((ext) => {
      console.log(`  - ${ext.extname} (v${ext.extversion})`);
    });

    // Test 3: Check tables
    console.log('\nTest 3: Check tables');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log('✅ Tables found:');
    tables.forEach((table) => {
      console.log(`  - ${table.table_name}`);
    });

    // Test 4: Insert test document
    console.log('\nTest 4: Insert test document');
    const doc = await sql`
      INSERT INTO documents (title, file_name, file_type, file_size, blob_url, status)
      VALUES ('Test Document', 'test.txt', 'txt', 1024, 'http://example.com/test.txt', 'completed')
      RETURNING id, title, status;
    `;
    console.log('✅ Document inserted:', doc[0]);

    // Test 5: Query test document
    console.log('\nTest 5: Query test document');
    const docs = await sql`
      SELECT id, title, status, upload_date
      FROM documents
      WHERE title = 'Test Document';
    `;
    console.log('✅ Document retrieved:', docs[0]);

    // Test 6: Clean up test data
    console.log('\nTest 6: Clean up test data');
    await sql`DELETE FROM documents WHERE title = 'Test Document'`;
    console.log('✅ Test data cleaned up');

    // Test 7: Check vector column
    console.log('\nTest 7: Check vector support');
    const vectorCheck = await sql`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'document_chunks'
      AND column_name = 'embedding';
    `;
    console.log('✅ Vector column:', vectorCheck[0]);

    console.log('\n🎉 All tests passed! Database is ready to use.\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

testDatabase();
