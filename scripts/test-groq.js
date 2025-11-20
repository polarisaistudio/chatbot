#!/usr/bin/env node

/**
 * Test Groq API connection and LLM functionality
 */

const Groq = require('groq-sdk').default;

async function testGroq() {
  console.log('🤖 Testing Groq API connection...\n');

  require('dotenv').config({ path: '.env.local' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    console.error('❌ GROQ_API_KEY not configured in .env.local');
    process.exit(1);
  }

  const groq = new Groq({ apiKey });

  try {
    // Test 1: Simple completion
    console.log('Test 1: Basic completion');
    const response1 = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Say "Hello from Groq!" in one sentence.',
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 100,
    });

    console.log('✅ Response:', response1.choices[0].message.content);
    console.log('   Model:', response1.model);
    console.log('   Tokens:', response1.usage.total_tokens);

    // Test 2: RAG-style query (simulating context)
    console.log('\nTest 2: RAG-style query with context');
    const context = `
Product: Polaris AI Support
Description: An AI-powered customer support chatbot using RAG technology.
Features: Knowledge base management, multi-language support, embeddable widget.
Price: Free tier available.
    `.trim();

    const response2 = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful customer support assistant. Use the following context to answer questions accurately.',
        },
        {
          role: 'user',
          content: `Context: ${context}\n\nQuestion: What is Polaris AI Support and what are its main features?`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 200,
    });

    console.log('✅ Response:', response2.choices[0].message.content);
    console.log('   Tokens:', response2.usage.total_tokens);

    // Test 3: Multi-language (Chinese)
    console.log('\nTest 3: Multi-language support (Chinese)');
    const response3 = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: '用中文回答：你好，请介绍一下自己。',
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 150,
    });

    console.log('✅ Response:', response3.choices[0].message.content);
    console.log('   Tokens:', response3.usage.total_tokens);

    // Test 4: Streaming response
    console.log('\nTest 4: Streaming response');
    process.stdout.write('✅ Streaming: ');

    const stream = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Count from 1 to 5 slowly, one number per line.',
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 100,
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      process.stdout.write(content);
      fullResponse += content;
    }
    console.log('\n   Streaming completed successfully!');

    // Test 5: Available models
    console.log('\nTest 5: Check available models');
    const models = await groq.models.list();
    console.log('✅ Available models:');
    models.data
      .filter((m) => m.id.includes('llama') || m.id.includes('mixtral'))
      .slice(0, 5)
      .forEach((model) => {
        console.log(`   - ${model.id}`);
      });

    // Summary
    console.log('\n🎉 All Groq API tests passed!\n');
    console.log('Summary:');
    console.log('  ✅ Basic completion working');
    console.log('  ✅ RAG-style context handling working');
    console.log('  ✅ Chinese language support confirmed');
    console.log('  ✅ Streaming responses working');
    console.log('  ✅ Model access confirmed');
    console.log('\n🚀 Groq API is ready for use!\n');
  } catch (error) {
    console.error('\n❌ Groq API test failed:', error.message);
    if (error.status) {
      console.error('   Status:', error.status);
    }
    if (error.error) {
      console.error('   Error:', error.error);
    }
    process.exit(1);
  }
}

testGroq();
