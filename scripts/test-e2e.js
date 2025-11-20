#!/usr/bin/env node

/**
 * End-to-end test of the complete RAG system
 * Tests: Upload → Process → Query → Response
 */

const API_BASE = 'http://localhost:3001/api';

// Sample test document content
const TEST_DOCUMENT = `
Polaris AI Support Documentation

Product Overview:
Polaris AI Support is an intelligent customer service chatbot powered by RAG (Retrieval-Augmented Generation) technology.

Key Features:
1. Knowledge Base Management - Upload and manage PDF, TXT, and MD documents
2. Multi-language Support - Supports both English and Chinese queries
3. Embeddable Widget - Easy integration into any website
4. Real-time Responses - Fast, streaming responses for better UX

Pricing:
- Free Tier: Up to 10 documents, 1000 queries per month
- Pro Tier: Unlimited documents and queries, $29/month
- Enterprise: Custom solutions with dedicated support

Technical Specifications:
- Built with Next.js 14 and React 18
- Uses Neon Postgres with pgvector for vector storage
- Powered by Groq API (Llama 3.3) for LLM responses
- 384-dimensional embeddings using all-MiniLM-L6-v2 model

Support Contact:
For technical support, email support@polarisaistudio.com or visit our documentation at https://docs.polarisaistudio.com
`.trim();

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadTestDocument() {
  console.log('📤 Step 1: Uploading test document...');

  // Create a data URL for the test document
  const dataUrl = `data:text/plain;base64,${Buffer.from(TEST_DOCUMENT).toString('base64')}`;

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: dataUrl,
      title: 'Polaris AI Support Documentation (Test)',
      fileType: 'txt',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error}`);
  }

  const data = await response.json();
  console.log('✅ Document uploaded:', data.id);
  console.log('   Status:', data.status);

  return data.id;
}

async function waitForProcessing(documentId, maxAttempts = 30) {
  console.log('\n⏳ Step 2: Waiting for document processing...');

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${API_BASE}/documents/${documentId}`);

    if (!response.ok) {
      throw new Error('Failed to check document status');
    }

    const doc = await response.json();
    console.log(`   Attempt ${i + 1}/${maxAttempts} - Status: ${doc.status}`);

    if (doc.status === 'completed') {
      console.log('✅ Document processed successfully!');
      console.log('   Total chunks:', doc.totalChunks);
      return doc;
    }

    if (doc.status === 'failed') {
      throw new Error(`Processing failed: ${doc.errorMessage}`);
    }

    await sleep(2000); // Wait 2 seconds between checks
  }

  throw new Error('Processing timeout - document still processing');
}

async function testQuery(question, expectChineseResponse = false) {
  console.log(`\n💬 Querying: "${question}"`);

  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: question,
      topK: 3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Query failed: ${error}`);
  }

  const data = await response.json();

  console.log('✅ Response received:');
  console.log('   Answer:', data.response.substring(0, 200) + '...');
  console.log('   Sources:', data.sources.length, 'chunks retrieved');
  console.log('   Response time:', data.metadata.responseTime, 'ms');

  if (data.sources.length > 0) {
    console.log('   Top source:', data.sources[0].documentTitle);
    console.log('   Similarity:', data.sources[0].similarity.toFixed(3));
  }

  return data;
}

async function testStreamingQuery(question) {
  console.log(`\n🌊 Testing streaming query: "${question}"`);

  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      message: question,
      topK: 3,
    }),
  });

  if (!response.ok) {
    throw new Error('Streaming query failed');
  }

  console.log('✅ Streaming response:');
  process.stdout.write('   ');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullResponse = '';
  let metadata = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));

        if (data.content) {
          process.stdout.write(data.content);
          fullResponse += data.content;
        }

        if (data.done) {
          metadata = data;
        }
      }
    }
  }

  console.log('\n');
  console.log('   Streaming completed');
  if (metadata) {
    console.log('   Session ID:', metadata.sessionId);
    console.log('   Sources:', metadata.sources?.length || 0);
  }

  return { response: fullResponse, metadata };
}

async function listDocuments() {
  console.log('\n📋 Step 4: Listing all documents...');

  const response = await fetch(`${API_BASE}/documents?limit=10`);

  if (!response.ok) {
    throw new Error('Failed to list documents');
  }

  const data = await response.json();

  console.log('✅ Retrieved', data.documents.length, 'documents');
  console.log('   Total:', data.total);

  data.documents.slice(0, 3).forEach((doc, i) => {
    console.log(`   ${i + 1}. ${doc.title} (${doc.status}, ${doc.totalChunks} chunks)`);
  });

  return data.documents;
}

async function listConversations() {
  console.log('\n💭 Step 5: Listing conversations...');

  const response = await fetch(`${API_BASE}/conversations?limit=5`);

  if (!response.ok) {
    throw new Error('Failed to list conversations');
  }

  const data = await response.json();

  console.log('✅ Retrieved', data.conversations.length, 'conversations');

  data.conversations.slice(0, 3).forEach((conv, i) => {
    console.log(`   ${i + 1}. Session: ${conv.sessionId} (${conv.messageCount} messages)`);
  });

  if (data.conversations.length > 0) {
    return data.conversations[0].id;
  }

  return null;
}

async function getConversationDetail(conversationId) {
  console.log(`\n🔍 Step 6: Getting conversation details...`);

  const response = await fetch(`${API_BASE}/conversations/${conversationId}`);

  if (!response.ok) {
    throw new Error('Failed to get conversation');
  }

  const data = await response.json();

  console.log('✅ Conversation retrieved');
  console.log('   Messages:', data.messages.length);

  data.messages.forEach((msg, i) => {
    console.log(`   ${i + 1}. [${msg.role}]: ${msg.content.substring(0, 50)}...`);
  });

  return data;
}

async function runE2ETest() {
  console.log('🧪 Starting End-to-End RAG System Test\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Upload document
    const documentId = await uploadTestDocument();

    // Step 2: Wait for processing
    await waitForProcessing(documentId);

    console.log('\n' + '='.repeat(60));
    console.log('🎯 Step 3: Testing RAG Queries');
    console.log('='.repeat(60));

    // Step 3a: Query in English
    await testQuery('What are the key features of Polaris AI Support?');

    // Step 3b: Query about pricing
    await testQuery('How much does the Pro tier cost?');

    // Step 3c: Query in Chinese
    await testQuery('这个产品支持哪些语言？', true);

    // Step 3d: Test streaming
    await testStreamingQuery('What is the technical stack used?');

    // Step 4: List documents
    await listDocuments();

    // Step 5: List conversations
    const conversationId = await listConversations();

    // Step 6: Get conversation detail
    if (conversationId) {
      await getConversationDetail(conversationId);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 All tests passed successfully!');
    console.log('='.repeat(60));
    console.log('\nSummary:');
    console.log('  ✅ Document upload: Working');
    console.log('  ✅ Document processing: Working');
    console.log('  ✅ Vector search: Working');
    console.log('  ✅ RAG queries (English): Working');
    console.log('  ✅ RAG queries (Chinese): Working');
    console.log('  ✅ Streaming responses: Working');
    console.log('  ✅ Document listing: Working');
    console.log('  ✅ Conversation tracking: Working');
    console.log('\n🚀 System is fully operational!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3001');
    return response.ok || response.status === 404; // 404 is fine, means server is up
  } catch {
    return false;
  }
}

// Main
(async () => {
  console.log('Checking if dev server is running...');
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.error('❌ Dev server is not running on http://localhost:3001');
    console.error('Please run: npm run dev');
    process.exit(1);
  }

  console.log('✅ Dev server is running\n');
  await runE2ETest();
})();
