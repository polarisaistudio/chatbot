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
 * Fallback response when no context is found
 */
export function getFallbackResponse(language: 'en' | 'zh' = 'en'): string {
  if (language === 'zh') {
    return '抱歉，我在知识库中没有找到相关信息来回答您的问题。您能否提供更多详细信息，或者尝试用不同的方式提问？';
  }

  return "I apologize, but I couldn't find relevant information in the knowledge base to answer your question. Could you provide more details or try rephrasing your question?";
}

/**
 * Detect language from query text
 */
export function detectLanguage(text: string): 'en' | 'zh' {
  // Simple detection: if text contains Chinese characters, assume Chinese
  const chineseRegex = /[\u4e00-\u9fa5]/;
  return chineseRegex.test(text) ? 'zh' : 'en';
}
