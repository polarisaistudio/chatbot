#!/usr/bin/env node

/**
 * Clean up test documents from database
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function cleanup() {
  console.log('🧹 Cleaning up test documents...\n');

  try {
    // Delete all test documents (and cascading deletes will remove chunks)
    const result = await sql`
      DELETE FROM documents
      WHERE title LIKE '%Test%'
      RETURNING id, title
    `;

    console.log(`✅ Deleted ${result.length} test documents:\n`);

    result.forEach((doc, i) => {
      console.log(`  ${i + 1}. ${doc.title}`);
    });

    console.log('\n✨ Database cleaned up!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanup();
