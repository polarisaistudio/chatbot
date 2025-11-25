/**
 * LLM prompt templates for RAG
 */

import type { SearchResult } from '@/lib/rag/vector-search';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PromptContext {
  chunks: SearchResult[];
  question: string;
  language?: 'en' | 'zh';
  conversationHistory?: ConversationMessage[];
}

/**
 * Build context from search results
 */
export function buildContext(chunks: SearchResult[]): string {
  if (chunks.length === 0) {
    return 'No relevant information found in the knowledge base.';
  }

  return chunks
    .map((chunk, index) => {
      return `[Document ${index + 1}: ${chunk.documentTitle}]
${chunk.chunkText}`;
    })
    .join('\n\n---\n\n');
}

/**
 * System prompt for customer support
 */
export const SYSTEM_PROMPT = `You are a helpful and friendly customer support assistant. Your role is to answer questions based on the provided context from the knowledge base.

Guidelines:
- Use ONLY the information provided in the context to answer questions
- If the answer is not in the context, politely say you don't have that information
- Be concise but thorough in your responses
- Maintain a professional and friendly tone
- If the user asks in Chinese, respond in Chinese. If in English, respond in English.
- Always cite which document the information comes from when possible
- Consider the conversation history to provide contextual and relevant responses
- If the user refers to previous messages (e.g., "what did you just say", "tell me more about that"), use the conversation history to understand the context

Remember: You are representing the company's customer support, so be helpful, accurate, and professional.`;

/**
 * Build user prompt with context
 */
export function buildUserPrompt(context: PromptContext): string {
  const contextStr = buildContext(context.chunks);

  return `Context from knowledge base:

${contextStr}

---

User Question: ${context.question}

Please provide a helpful answer based on the context above. If the context doesn't contain relevant information, politely let the user know.`;
}

/**
 * Build messages for chat completion with conversation history
 */
export function buildChatMessages(context: PromptContext) {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system' as const,
      content: SYSTEM_PROMPT,
    },
  ];

  // Add conversation history (limit to last 10 messages to avoid context overflow)
  if (context.conversationHistory && context.conversationHistory.length > 0) {
    const recentHistory = context.conversationHistory.slice(-10);
    recentHistory.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });
  }

  // Add current query with context
  messages.push({
    role: 'user' as const,
    content: buildUserPrompt(context),
  });

  return messages;
}

/**
 * Check if the message is a greeting
 */
export function isGreeting(text: string): boolean {
  const greetings = [
    'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon',
    'good evening', 'howdy', "what's up", 'sup', 'yo',
    '你好', '嗨', '哈喽', '早上好', '下午好', '晚上好'
  ];
  const normalizedText = text.toLowerCase().trim();
  return greetings.some(g => normalizedText === g || normalizedText.startsWith(g + ' ') || normalizedText.startsWith(g + '!') || normalizedText.startsWith(g + ','));
}

/**
 * Get greeting response
 */
export function getGreetingResponse(language: 'en' | 'zh' = 'en'): string {
  if (language === 'zh') {
    return '您好！我是Polaris AI Studio的智能客服助手。请问有什么可以帮您的？';
  }
  return "Hello! I'm the Polaris AI Studio support assistant. How can I help you today?";
}

/**
 * Check if the message is asking for help/capabilities
 */
export function isHelpQuery(text: string): boolean {
  const helpPatterns = [
    'how can you help',
    'what can you do',
    'what do you do',
    'what are you',
    'who are you',
    'help me',
    'what services',
    'what can you help',
    '你能帮我什么',
    '你能做什么',
    '你是谁',
    '你是什么'
  ];
  const normalizedText = text.toLowerCase().trim();
  return helpPatterns.some(p => normalizedText.includes(p));
}

/**
 * Get help/capabilities response
 */
export function getHelpResponse(language: 'en' | 'zh' = 'en'): string {
  if (language === 'zh') {
    return `我是Polaris AI Studio的智能客服助手，可以帮助您了解：

• **AI自动化服务** - 了解我们如何帮助小型企业节省时间和成本
• **案例研究** - 查看我们帮助过的沙龙、诊所、房产中介、餐厅和电商店铺的成功案例
• **定价方案** - 获取适合您业务的定价信息
• **联系方式** - 预约免费30分钟咨询

请随时告诉我您想了解什么！`;
  }
  return `I'm the Polaris AI Studio support assistant. I can help you with:

• **AI Automation Services** - Learn how we help small businesses save time and money
• **Case Studies** - See success stories from salons, clinics, real estate agents, restaurants, and e-commerce stores
• **Pricing** - Get pricing information that fits your business
• **Contact** - Book a free 30-minute consultation

Feel free to ask me about any of these topics!`;
}

/**
 * Fallback response when no context is found
 */
export function getFallbackResponse(language: 'en' | 'zh' = 'en'): string {
  if (language === 'zh') {
    return '我目前没有这方面的信息。如果您想进一步了解，欢迎预约免费咨询：https://calendly.com/polarisaistudio/introduction-call';
  }

  return "I don't have information on that topic. If you'd like to learn more, feel free to book a free consultation: https://calendly.com/polarisaistudio/introduction-call";
}

/**
 * Detect language from query text
 */
export function detectLanguage(text: string): 'en' | 'zh' {
  // Simple detection: if text contains Chinese characters, assume Chinese
  const chineseRegex = /[\u4e00-\u9fa5]/;
  return chineseRegex.test(text) ? 'zh' : 'en';
}
