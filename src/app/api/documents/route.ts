/**
 * Documents API - List all documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { listDocumentsSchema } from '@/lib/validation';
import { handleError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { desc, eq, sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/documents - List all documents
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      status: searchParams.get('status'),
    };

    const validation = listDocumentsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { limit, offset, status } = validation.data;

    logger.debug('Listing documents', {
      context: 'DocumentsAPI',
      metadata: { limit, offset, status },
    });

    // Build query
    const results = await db
      .select()
      .from(documents)
      .where(status !== 'all' ? eq(documents.status, status as any) : sql`true`)
      .orderBy(desc(documents.uploadDate))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(status !== 'all' ? eq(documents.status, status as any) : sql`true`);

    logger.info(`Retrieved ${results.length} documents`, {
      context: 'DocumentsAPI',
      metadata: { total: count, returned: results.length },
    });

    return NextResponse.json({
      documents: results.map((doc) => ({
        id: doc.id,
        title: doc.title,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        status: doc.status,
        totalChunks: doc.totalChunks,
        uploadDate: doc.uploadDate.toISOString(),
        errorMessage: doc.errorMessage,
      })),
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    const errorData = handleError(error);
    logger.error('Documents API error', error as Error, { context: 'DocumentsAPI' });

    return NextResponse.json(
      { error: errorData.message },
      { status: errorData.statusCode }
    );
  }
}
