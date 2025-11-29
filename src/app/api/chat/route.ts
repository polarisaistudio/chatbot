/**
 * Chat API endpoint - RAG query with streaming
 */

import { NextRequest, NextResponse } from 'next/server';
import { ragQueryEngine } from '@/lib/rag';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { chatRequestSchema } from '@/lib/validation';
import { handleError, ValidationError } from '@/lib/utils/errors';
import { generateSessionId } from '@/lib/utils/helpers';
import { logger } from '@/lib/utils/logger';
import { getConversationHistory } from '@/lib/utils/conversation';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1 minute for chat (handles cold start + LLM response)

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://polarisaistudio.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * OPTIONS /api/chat - Handle preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}


/**
 * POST /api/chat - Send a message and get AI response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = chatRequestSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    const { message: userMessage, sessionId: providedSessionId, topK } = validation.data;

    logger.info('Chat request received', {
      context: 'ChatAPI',
      metadata: {
        messageLength: userMessage.length,
        sessionId: providedSessionId,
      },
    });

    // Get or create conversation
    let sessionId = providedSessionId || generateSessionId();
    let conversation = providedSessionId
      ? await db.query.conversations.findFirst({
          where: eq(conversations.sessionId, providedSessionId),
        })
      : null;

    if (!conversation) {
      // Create new conversation
      const [newConversation] = await db
        .insert(conversations)
        .values({
          sessionId,
          userIp: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        })
        .returning();

      conversation = newConversation;
      logger.info('Created new conversation', {
        context: 'ChatAPI',
        metadata: { sessionId },
      });
    }

    // Store user message
    await db.insert(messages).values({
      conversationId: conversation.id,
      role: 'user',
      content: userMessage,
    });

    // Get conversation history (excluding the current message)
    const conversationHistory = await getConversationHistory(conversation.id);

    // Check if streaming is requested
    const acceptHeader = request.headers.get('accept');
    const wantsStream = acceptHeader?.includes('text/event-stream');

    if (wantsStream) {
      // Return streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let fullResponse = '';
            let sources: any[] = [];
            let metadata: any = {};

            for await (const chunk of ragQueryEngine.queryStream(
              userMessage,
              topK,
              conversationHistory
            )) {
              if (chunk.type === 'metadata') {
                sources = chunk.data.sources;
                metadata = chunk.data;
              } else if (chunk.type === 'chunk') {
                fullResponse += chunk.content;
                // Send SSE format
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
                );
              }
            }

            // Store assistant message
            if (conversation) {
              await db.insert(messages).values({
                conversationId: conversation.id,
                role: 'assistant',
                content: fullResponse,
                metadata: {
                  sources: sources.map((s) => ({
                    documentId: s.documentId,
                    documentTitle: s.documentTitle,
                    similarity: s.similarity,
                  })),
                  ...metadata,
                },
              });

              // Update conversation message count
              await db
                .update(conversations)
                .set({
                  messageCount: (conversation.messageCount || 0) + 2,
                })
                .where(eq(conversations.id, conversation.id));
            }

            // Send final metadata
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  done: true,
                  sessionId,
                  sources,
                  metadata,
                })}\n\n`
              )
            );

            controller.close();
          } catch (error) {
            const errorData = handleError(error);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: errorData.message })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          ...corsHeaders,
        },
      });
    } else {
      // Return non-streaming response
      const startTime = Date.now();
      const result = await ragQueryEngine.query(userMessage, topK, conversationHistory);
      const responseTime = Date.now() - startTime;

      // Store assistant message
      await db.insert(messages).values({
        conversationId: conversation.id,
        role: 'assistant',
        content: result.answer,
        metadata: {
          sources: result.sources.map((s) => ({
            documentId: s.documentId,
            documentTitle: s.documentTitle,
            similarity: s.similarity,
          })),
          responseTime,
          ...result.metadata,
        },
      });

      // Update conversation
      await db
        .update(conversations)
        .set({
          messageCount: (conversation.messageCount || 0) + 2,
        })
        .where(eq(conversations.id, conversation.id));

      logger.info('Chat response sent', {
        context: 'ChatAPI',
        metadata: {
          sessionId,
          responseTime,
          chunksUsed: result.sources.length,
        },
      });

      return NextResponse.json(
        {
          response: result.answer,
          sessionId,
          sources: result.sources.map((s) => ({
            documentId: s.documentId,
            documentTitle: s.documentTitle,
            chunkText: s.chunkText.substring(0, 200),
            similarity: s.similarity,
          })),
          metadata: {
            responseTime,
            ...result.metadata,
          },
        },
        { headers: corsHeaders }
      );
    }
  } catch (error) {
    const errorData = handleError(error);
    logger.error('Chat API error', error as Error, { context: 'ChatAPI' });

    return NextResponse.json(
      {
        error: errorData.message,
        code: errorData.code,
      },
      { status: errorData.statusCode, headers: corsHeaders }
    );
  }
}
