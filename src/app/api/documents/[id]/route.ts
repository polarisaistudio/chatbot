/**
 * Documents API - Get and delete by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { documentProcessor } from '@/lib/processing';
import { handleError, NotFoundError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/documents/[id] - Get document by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    logger.debug(`Getting document: ${id}`, { context: 'DocumentsAPI' });

    const document = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    return NextResponse.json({
      id: document.id,
      title: document.title,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      blobUrl: document.blobUrl,
      status: document.status,
      totalChunks: document.totalChunks,
      uploadDate: document.uploadDate.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
      errorMessage: document.errorMessage,
    });
  } catch (error) {
    const errorData = handleError(error);
    logger.error('Get document error', error as Error, { context: 'DocumentsAPI' });

    return NextResponse.json(
      { error: errorData.message },
      { status: errorData.statusCode }
    );
  }
}

/**
 * DELETE /api/documents/[id] - Delete document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    logger.info(`Deleting document: ${id}`, { context: 'DocumentsAPI' });

    // Check if document exists
    const document = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    // Delete document and all chunks (cascade)
    await documentProcessor.deleteDocument(id);

    logger.info(`Document deleted: ${id}`, { context: 'DocumentsAPI' });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    const errorData = handleError(error);
    logger.error('Delete document error', error as Error, { context: 'DocumentsAPI' });

    return NextResponse.json(
      { error: errorData.message },
      { status: errorData.statusCode }
    );
  }
}
