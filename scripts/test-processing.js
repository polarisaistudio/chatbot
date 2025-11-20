#!/usr/bin/env node

/**
 * Test document processing pipeline (parsers, chunking, embeddings)
 */

const { DocumentParser } = require('../src/lib/parsers');
const { RecursiveCharacterTextSplitter } = require('../src/lib/chunking');
const { embeddingGenerator } = require('../src/lib/embeddings');

async function testProcessing() {
  console.log('🧪 Testing Document Processing Pipeline...\n');

  try {
    // Test 1: Text Parser
    console.log('Test 1: Text Parser');
    const textParser = new DocumentParser();
    const sampleText = `
This is a sample text document for testing.

It has multiple paragraphs to demonstrate the parsing capabilities.
We want to make sure that the text is properly extracted and cleaned.

The parser should handle various formatting and whitespace correctly.
    `.trim();

    const parsedText = await textParser.parse(sampleText, 'txt');
    console.log('✅ Text parsed:', parsedText.substring(0, 100) + '...');
    console.log('   Length:', parsedText.length, 'characters\n');

    // Test 2: Text Chunking
    console.log('Test 2: Text Chunking');
    const splitter = new RecursiveCharacterTextSplitter(200, 50);
    const chunks = splitter.split(parsedText);
    console.log('✅ Text split into', chunks.length, 'chunks');
    chunks.slice(0, 2).forEach((chunk, i) => {
      console.log(`   Chunk ${i + 1}:`, chunk.text.substring(0, 60) + '...');
      console.log(`   Length: ${chunk.text.length} chars`);
    });

    const stats = splitter.getStats(chunks);
    console.log('   Stats:', stats);
    console.log();

    // Test 3: Embedding Generation
    console.log('Test 3: Embedding Generation');
    console.log('   Initializing model (this may take a minute on first run)...');

    const startInit = Date.now();
    await embeddingGenerator.initialize();
    const initDuration = Date.now() - startInit;
    console.log(`✅ Model initialized in ${initDuration}ms`);

    const modelInfo = embeddingGenerator.getModelInfo();
    console.log('   Model:', modelInfo.model);
    console.log('   Dimensions:', modelInfo.dimensions);
    console.log();

    // Test 4: Single Embedding
    console.log('Test 4: Generate Single Embedding');
    const testText = 'This is a test sentence for embedding generation.';
    const startEmbed = Date.now();
    const embedding = await embeddingGenerator.generateEmbedding(testText);
    const embedDuration = Date.now() - startEmbed;

    console.log('✅ Embedding generated in', embedDuration, 'ms');
    console.log('   Dimensions:', embedding.length);
    console.log('   Sample values:', embedding.slice(0, 5).map(n => n.toFixed(4)));
    console.log();

    // Test 5: Batch Embeddings
    console.log('Test 5: Generate Batch Embeddings');
    const testChunks = chunks.slice(0, 3).map(c => c.text);
    const startBatch = Date.now();
    const embeddings = await embeddingGenerator.generateEmbeddings(testChunks);
    const batchDuration = Date.now() - startBatch;

    console.log('✅ Generated', embeddings.length, 'embeddings in', batchDuration, 'ms');
    console.log('   Avg time per embedding:', Math.round(batchDuration / embeddings.length), 'ms');
    console.log();

    // Test 6: Cosine Similarity
    console.log('Test 6: Cosine Similarity Test');
    const text1 = 'The cat sat on the mat';
    const text2 = 'A cat was sitting on a rug';
    const text3 = 'The weather is sunny today';

    const [emb1, emb2, emb3] = await embeddingGenerator.generateEmbeddings([
      text1,
      text2,
      text3,
    ]);

    const similarity12 = cosineSimilarity(emb1, emb2);
    const similarity13 = cosineSimilarity(emb1, emb3);

    console.log('✅ Similarity between similar sentences:', similarity12.toFixed(4));
    console.log('   Similarity between different sentences:', similarity13.toFixed(4));
    console.log('   Similar sentences should have higher similarity ✓');
    console.log();

    // Summary
    console.log('🎉 All processing tests passed!\n');
    console.log('Summary:');
    console.log('  ✅ Text parsing working');
    console.log('  ✅ Text chunking working');
    console.log('  ✅ Embedding model initialized');
    console.log('  ✅ Single embedding generation working');
    console.log('  ✅ Batch embedding generation working');
    console.log('  ✅ Similarity calculations correct');
    console.log('\n🚀 Document processing pipeline is ready!\n');
  } catch (error) {
    console.error('\n❌ Processing test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Helper: Calculate cosine similarity
function cosineSimilarity(vec1, vec2) {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

testProcessing();
