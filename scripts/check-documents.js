/**
 * Check Documents in Database
 * Usage: node scripts/check-documents.js
 */

require('dotenv').config({ path: '.env.local' });
const { drizzle } = require('drizzle-orm/neon-serverless');
const { Pool } = require('@neondatabase/serverless');
const { documents, documentChunks } = require('../src/lib/db/schema');
const { sql } = require('drizzle-orm');

async function checkDocuments() {
  console.log('🔍 Checking documents in database...\n');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    // Check total documents
    const [{ count: totalDocs }] = await db
      .select({ count: sql`count(*)` })
      .from(documents);

    console.log(`📊 Total documents: ${totalDocs}\n`);

    if (totalDocs === 0) {
      console.log('❌ No documents found in database');
      await pool.end();
      return;
    }

    // List all documents
    const allDocs = await db.select().from(documents);

    console.log('📄 Documents:\n');
    allDocs.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Status: ${doc.status}`);
      console.log(`   Chunks: ${doc.totalChunks}`);
      console.log(`   Upload Date: ${doc.uploadDate}`);
      console.log(`   File Size: ${doc.fileSize} bytes`);
      if (doc.errorMessage) {
        console.log(`   Error: ${doc.errorMessage}`);
      }
      console.log('');
    });

    // Check chunks
    const [{ count: totalChunks }] = await db
      .select({ count: sql`count(*)` })
      .from(documentChunks);

    console.log(`\n🧩 Total chunks: ${totalChunks}`);

    await pool.end();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkDocuments();
