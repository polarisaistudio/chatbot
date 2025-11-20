#!/usr/bin/env node

/**
 * Debug script to investigate vector search issues
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { pipeline } from '@xenova/transformers';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkDocumentChunks() {
  console.log('🔍 Checking document chunks in database...\n');

  const chunks = await sql`
    SELECT
      dc.id,
      dc.document_id,
      d.title as document_title,
      dc.chunk_text,
      dc.chunk_index,
      dc.embedding IS NOT NULL as has_embedding
    FROM document_chunks dc
    JOIN documents d ON dc.document_id = d.id
    ORDER BY dc.created_at DESC
    LIMIT 5
  `;

  console.log(`Found ${chunks.length} chunks:\n`);

  chunks.forEach((chunk, i) => {
    console.log(`Chunk ${i + 1}:`);
    console.log(`  Document: ${chunk.document_title}`);
    console.log(`  Text length: ${chunk.chunk_text?.length || 0} characters`);
    console.log(`  Text preview: ${chunk.chunk_text?.substring(0, 100)}...`);
    console.log(`  Has embedding: ${chunk.has_embedding}`);
    console.log('');
  });

  return chunks;
}

async function testEmbeddingGeneration() {
  console.log('🧪 Testing embedding generation...\n');

  const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const testTexts = [
    'What are the key features of Polaris AI Support?',
    'Polaris AI Support is an intelligent customer service chatbot',
  ];

  for (const text of testTexts) {
    console.log(`Text: "${text.substring(0, 50)}..."`);
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);
    console.log(`  Generated embedding: ${embedding.length} dimensions`);
    console.log(`  First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`);
    console.log('');
  }
}

async function testVectorSearch(queryText) {
  console.log(`🔎 Testing vector search for: "${queryText}"\n`);

  // Generate query embedding
  const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await pipe(queryText, { pooling: 'mean', normalize: true });
  const queryEmbedding = Array.from(output.data);

  console.log(`Query embedding: ${queryEmbedding.length} dimensions`);
  console.log(`First 5 values: [${queryEmbedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]\n`);

  // Perform vector search
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  console.log('Executing vector search query...\n');

  const results = await sql`
    SELECT
      dc.id as chunk_id,
      dc.document_id,
      d.title as document_title,
      dc.chunk_text,
      1 - (dc.embedding <=> ${embeddingStr}::vector) as similarity
    FROM document_chunks dc
    JOIN documents d ON dc.document_id = d.id
    WHERE d.status = 'completed'
    ORDER BY dc.embedding <=> ${embeddingStr}::vector
    LIMIT 5
  `;

  console.log(`Found ${results.length} results:\n`);

  results.forEach((result, i) => {
    console.log(`Result ${i + 1}:`);
    console.log(`  Document: ${result.document_title}`);
    console.log(`  Similarity: ${result.similarity?.toFixed(4) || 'N/A'}`);
    console.log(`  Text: ${result.chunk_text?.substring(0, 100)}...`);
    console.log('');
  });

  return results;
}

async function checkPgvectorExtension() {
  console.log('🔧 Checking pgvector extension...\n');

  const extensions = await sql`
    SELECT * FROM pg_extension WHERE extname = 'vector'
  `;

  if (extensions.length > 0) {
    console.log('✅ pgvector extension is installed\n');
  } else {
    console.log('❌ pgvector extension is NOT installed\n');
  }

  return extensions.length > 0;
}

async function main() {
  console.log('🐛 Vector Search Debug Tool\n');
  console.log('='.repeat(60) + '\n');

  try {
    // 1. Check pgvector extension
    await checkPgvectorExtension();

    // 2. Check document chunks
    const chunks = await checkDocumentChunks();

    if (chunks.length === 0) {
      console.log('⚠️  No chunks found in database. Upload and process a document first.');
      return;
    }

    console.log('='.repeat(60) + '\n');

    // 3. Test embedding generation
    await testEmbeddingGeneration();

    console.log('='.repeat(60) + '\n');

    // 4. Test vector search
    const results = await testVectorSearch('What are the key features of Polaris AI Support?');

    console.log('='.repeat(60) + '\n');

    if (results.length === 0) {
      console.log('❌ Vector search returned 0 results');
      console.log('\nPossible issues:');
      console.log('  1. Embeddings not stored correctly');
      console.log('  2. Vector search query syntax error');
      console.log('  3. All similarities below threshold');
      console.log('  4. pgvector index not working');
    } else {
      console.log('✅ Vector search is working!');
      console.log(`   Found ${results.length} results`);
      console.log(`   Top similarity: ${results[0]?.similarity?.toFixed(4)}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
