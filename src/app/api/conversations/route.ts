/**
 * Conversations API - List all conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema';
import { listConversationsSchema } from '@/lib/validation';
import { handleError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { desc, sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/conversations - List all conversations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    };

    const validation = listConversationsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { limit, offset } = validation.data;

    logger.debug('Listing conversations', {
      context: 'ConversationsAPI',
      metadata: { limit, offset },
    });

    const results = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.startedAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversations);

    logger.info(`Retrieved ${results.length} conversations`, {
      context: 'ConversationsAPI',
      metadata: { total: count, returned: results.length },
    });

    return NextResponse.json({
      conversations: results.map((conv) => ({
        id: conv.id,
        sessionId: conv.sessionId,
        startedAt: conv.startedAt.toISOString(),
        endedAt: conv.endedAt?.toISOString(),
        messageCount: conv.messageCount,
      })),
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    const errorData = handleError(error);
    logger.error('Conversations API error', error as Error, {
      context: 'ConversationsAPI',
    });

    return NextResponse.json(
      { error: errorData.message },
      { status: errorData.statusCode }
    );
  }
}
