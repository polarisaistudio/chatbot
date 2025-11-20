/**
 * Conversations API - Get conversation with messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { handleError, NotFoundError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/conversations/[id] - Get conversation with all messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    logger.debug(`Getting conversation: ${id}`, { context: 'ConversationsAPI' });

    // Get conversation
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, id),
      with: {
        messages: {
          orderBy: (messages, { asc }) => [asc(messages.timestamp)],
        },
      },
    });

    if (!conversation) {
      throw new NotFoundError('Conversation');
    }

    logger.info(`Retrieved conversation with ${conversation.messages.length} messages`, {
      context: 'ConversationsAPI',
      metadata: { conversationId: id },
    });

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        sessionId: conversation.sessionId,
        startedAt: conversation.startedAt.toISOString(),
        endedAt: conversation.endedAt?.toISOString(),
        messageCount: conversation.messageCount,
      },
      messages: conversation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        metadata: msg.metadata,
      })),
    });
  } catch (error) {
    const errorData = handleError(error);
    logger.error('Get conversation error', error as Error, {
      context: 'ConversationsAPI',
    });

    return NextResponse.json(
      { error: errorData.message },
      { status: errorData.statusCode }
    );
  }
}
