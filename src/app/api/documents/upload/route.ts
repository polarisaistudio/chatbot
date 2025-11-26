/**
 * Document upload API
 * For MVP: accepts URL to process
 * Future: Will handle file upload to Vercel Blob
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { documentProcessor } from '@/lib/processing';
import { handleError, ValidationError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for document processing

/**
 * POST /api/documents/upload - Upload and process document
 *
 * For MVP, accepts a URL to a publicly accessible document
 * Future enhancement: Handle multipart file upload to Vercel Blob
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, title, fileType } = body;

    // Validate required fields
    if (!url || !title || !fileType) {
      throw new ValidationError('url, title, and fileType are required');
    }

    if (!['pdf', 'txt', 'md'].includes(fileType)) {
      throw new ValidationError('fileType must be pdf, txt, or md');
    }

    logger.info('Document upload request received', {
      context: 'UploadAPI',
      metadata: { title, fileType },
    });

    // Create document record
    const [document] = await db
      .insert(documents)
      .values({
        title,
        fileName: title,
        fileType,
        fileSize: 0, // Unknown for URL
        blobUrl: url,
        status: 'processing',
      })
      .returning();

    logger.info(`Created document record: ${document.id}`, {
      context: 'UploadAPI',
    });

    // Process document asynchronously (in background)
    // For now, we'll process it immediately
    // In production, you'd want to use a queue (Vercel Queue, BullMQ, etc.)
    documentProcessor
      .processDocument(document.id, url, fileType as any)
      .then((result) => {
        if (result.success) {
          logger.info(
            `Document processed successfully: ${document.id} (${result.totalChunks} chunks)`,
            { context: 'UploadAPI' }
          );
        } else {
          logger.error(
            `Document processing failed: ${document.id}`,
            new Error(result.error),
            { context: 'UploadAPI' }
          );
        }
      })
      .catch((error) => {
        logger.error(
          `Document processing error: ${document.id}`,
          error,
          { context: 'UploadAPI' }
        );
      });

    return NextResponse.json(
      {
        id: document.id,
        title: document.title,
        status: document.status,
        message: 'Document uploaded and processing started',
      },
      { status: 202 } // 202 Accepted - processing in background
    );
  } catch (error) {
    const errorData = handleError(error);
    logger.error('Upload API error', error as Error, { context: 'UploadAPI' });

    return NextResponse.json(
      { error: errorData.message },
      { status: errorData.statusCode }
    );
  }
}
