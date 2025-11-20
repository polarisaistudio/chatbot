/**
 * Vector similarity search using pgvector
 */

import { db } from '@/lib/db';
import { documentChunks, documents } from '@/lib/db/schema';
import { sql, eq, desc } from 'drizzle-orm';
import { TOP_K_CHUNKS, MIN_SIMILARITY_SCORE } from '@/lib/constants';
import { logger } from '@/lib/utils/logger';

export interface SearchResult {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  chunkText: string;
  chunkIndex: number;
  similarity: number;
  metadata: Record<string, any>;
}

export class VectorSearch {
  /**
   * Search for similar document chunks using cosine similarity
   */
  async search(
    queryEmbedding: number[],
    limit: number = TOP_K_CHUNKS,
    minSimilarity: number = MIN_SIMILARITY_SCORE
  ): Promise<SearchResult[]> {
    try {
      const startTime = Date.now();

      // Convert embedding array to pgvector format
      const embeddingStr = `[${queryEmbedding.join(',')}]`;

      logger.debug('Executing vector similarity search', {
        context: 'VectorSearch',
        metadata: {
          embeddingDimensions: queryEmbedding.length,
          limit,
          minSimilarity,
        },
      });

      // Perform cosine similarity search using pgvector
      // Note: We use 1 - (embedding <=> query) to get similarity (higher is better)
      const results = await db
        .select({
          chunkId: documentChunks.id,
          documentId: documentChunks.documentId,
          documentTitle: documents.title,
          chunkText: documentChunks.chunkText,
          chunkIndex: documentChunks.chunkIndex,
          similarity: sql<number>`1 - (${documentChunks.embedding} <=> ${embeddingStr}::vector)`,
          metadata: documentChunks.metadata,
        })
        .from(documentChunks)
        .innerJoin(documents, eq(documentChunks.documentId, documents.id))
        .where(eq(documents.status, 'completed'))
        .orderBy(sql`${documentChunks.embedding} <=> ${embeddingStr}::vector`)
        .limit(limit);

      // Filter by minimum similarity
      const filteredResults = results.filter(
        (r) => r.similarity >= minSimilarity
      );

      const duration = Date.now() - startTime;

      logger.info(
        `Vector search completed: ${filteredResults.length} results in ${duration}ms`,
        {
          context: 'VectorSearch',
          metadata: {
            totalResults: results.length,
            filteredResults: filteredResults.length,
            avgSimilarity:
              filteredResults.length > 0
                ? (
                    filteredResults.reduce((sum, r) => sum + r.similarity, 0) /
                    filteredResults.length
                  ).toFixed(3)
                : 0,
          },
        }
      );

      return filteredResults.map((r) => ({
        chunkId: r.chunkId,
        documentId: r.documentId,
        documentTitle: r.documentTitle,
        chunkText: r.chunkText,
        chunkIndex: r.chunkIndex,
        similarity: r.similarity,
        metadata: r.metadata || {},
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Vector search failed', error as Error, {
        context: 'VectorSearch',
      });
      throw new Error(`Vector search failed: ${message}`);
    }
  }

  /**
   * Search with automatic query embedding generation
   */
  async searchByText(
    queryText: string,
    generateEmbedding: (text: string) => Promise<number[]>,
    limit?: number,
    minSimilarity?: number
  ): Promise<SearchResult[]> {
    logger.debug('Generating embedding for query text', {
      context: 'VectorSearch',
    });

    const embedding = await generateEmbedding(queryText);
    return this.search(embedding, limit, minSimilarity);
  }
}

// Export singleton instance
export const vectorSearch = new VectorSearch();
