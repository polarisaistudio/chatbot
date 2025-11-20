/**
 * Document processor - Orchestrates parse → chunk → embed → store
 */

import { db } from '@/lib/db';
import { documents, documentChunks } from '@/lib/db/schema';
import { DocumentParser } from '@/lib/parsers';
import { RecursiveCharacterTextSplitter } from '@/lib/chunking';
import { embeddingGenerator } from '@/lib/embeddings';
import { DocumentProcessingError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { eq } from 'drizzle-orm';
import type { FileType } from '@/types';

export interface ProcessingResult {
  documentId: string;
  totalChunks: number;
  processingTime: number;
  success: boolean;
  error?: string;
}

export class DocumentProcessor {
  private parser: DocumentParser;
  private splitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.parser = new DocumentParser();
    this.splitter = new RecursiveCharacterTextSplitter();
  }

  /**
   * Process a document end-to-end
   */
  async processDocument(
    documentId: string,
    fileUrl: string,
    fileType: FileType
  ): Promise<ProcessingResult> {
    const startTime = Date.now();

    logger.info(`Starting document processing: ${documentId}`, {
      context: 'DocumentProcessor',
      metadata: { documentId, fileType },
    });

    try {
      // Step 1: Parse document
      logger.debug('Step 1: Parsing document', {
        context: 'DocumentProcessor',
      });
      const text = await this.parser.parseFromUrl(fileUrl, fileType);

      if (!text || text.trim().length === 0) {
        throw new Error('Document contains no extractable text');
      }

      logger.info(`Parsed document: ${text.length} characters`, {
        context: 'DocumentProcessor',
      });

      // Step 2: Chunk text
      logger.debug('Step 2: Chunking text', { context: 'DocumentProcessor' });
      const chunks = this.splitter.split(text);

      if (chunks.length === 0) {
        throw new Error('No chunks generated from document');
      }

      logger.info(`Created ${chunks.length} chunks`, {
        context: 'DocumentProcessor',
        metadata: this.splitter.getStats(chunks),
      });

      // Step 3: Generate embeddings
      logger.debug('Step 3: Generating embeddings', {
        context: 'DocumentProcessor',
      });
      await embeddingGenerator.initialize();
      const chunkTexts = chunks.map((c) => c.text);
      const embeddings = await embeddingGenerator.generateEmbeddings(chunkTexts);

      logger.info(`Generated ${embeddings.length} embeddings`, {
        context: 'DocumentProcessor',
      });

      // Step 4: Store chunks with embeddings
      logger.debug('Step 4: Storing chunks in database', {
        context: 'DocumentProcessor',
      });

      // Prepare chunks for insertion
      const chunksToInsert = chunks.map((chunk, index) => ({
        documentId,
        chunkText: chunk.text,
        chunkIndex: index,
        embedding: embeddings[index],
        metadata: {
          ...chunk.metadata,
          originalLength: text.length,
        },
      }));

      // Insert chunks in batches
      const batchSize = 50;
      for (let i = 0; i < chunksToInsert.length; i += batchSize) {
        const batch = chunksToInsert.slice(i, i + batchSize);
        await db.insert(documentChunks).values(batch);
        logger.debug(
          `Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            chunksToInsert.length / batchSize
          )}`,
          { context: 'DocumentProcessor' }
        );
      }

      // Step 5: Update document status
      await db
        .update(documents)
        .set({
          status: 'completed',
          totalChunks: chunks.length,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, documentId));

      const processingTime = Date.now() - startTime;

      logger.info(
        `Document processing completed in ${processingTime}ms: ${chunks.length} chunks stored`,
        {
          context: 'DocumentProcessor',
          metadata: {
            documentId,
            chunks: chunks.length,
            processingTime,
          },
        }
      );

      return {
        documentId,
        totalChunks: chunks.length,
        processingTime,
        success: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Document processing failed', error as Error, {
        context: 'DocumentProcessor',
        metadata: { documentId },
      });

      // Update document status to failed
      try {
        await db
          .update(documents)
          .set({
            status: 'failed',
            errorMessage: message,
            updatedAt: new Date(),
          })
          .where(eq(documents.id, documentId));
      } catch (updateError) {
        logger.error('Failed to update document status', updateError as Error, {
          context: 'DocumentProcessor',
        });
      }

      const processingTime = Date.now() - startTime;

      return {
        documentId,
        totalChunks: 0,
        processingTime,
        success: false,
        error: message,
      };
    }
  }

  /**
   * Delete document and all its chunks
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      logger.info(`Deleting document: ${documentId}`, {
        context: 'DocumentProcessor',
      });

      // Delete document (chunks will be cascade deleted)
      await db.delete(documents).where(eq(documents.id, documentId));

      logger.info(`Document deleted: ${documentId}`, {
        context: 'DocumentProcessor',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Document deletion failed', error as Error, {
        context: 'DocumentProcessor',
      });
      throw new DocumentProcessingError(`Document deletion failed: ${message}`);
    }
  }
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor();
