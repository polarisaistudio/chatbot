/**
 * Conversation history utilities
 */

import { db } from '@/lib/db';
import { messages } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { ConversationMessage } from '@/lib/prompts/templates';

/**
 * Fetch recent conversation history for a conversation
 * @param conversationId - The conversation ID
 * @param limit - Maximum number of messages to fetch (default: 10)
 * @returns Array of conversation messages
 */
export async function getConversationHistory(
  conversationId: string,
  limit: number = 10
): Promise<ConversationMessage[]> {
  const recentMessages = await db
    .select({
      role: messages.role,
      content: messages.content,
      timestamp: messages.timestamp,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.timestamp))
    .limit(limit);

  // Reverse to get chronological order (oldest first)
  return recentMessages
    .reverse()
    .map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
}
