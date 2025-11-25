/**
 * Vector similarity search using pgvector
 */

import { db } from '@/lib/db';
import { documentChunks, documents } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';
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

      // Using raw SQL for vector similarity search
      // Note: Using subquery approach because ORDER BY embedding <=> vector
      // has issues with Neon HTTP driver for certain embeddings
      const rawQuery = sql`
        SELECT * FROM (
          SELECT
            dc.id as "chunkId",
            dc.document_id as "documentId",
            d.title as "documentTitle",
            dc.chunk_text as "chunkText",
            dc.chunk_index as "chunkIndex",
            1 - (dc.embedding <=> ${embeddingStr}::vector) as similarity,
            dc.metadata
          FROM document_chunks dc
          INNER JOIN documents d ON dc.document_id = d.id
          WHERE d.status = 'completed'
        ) sub
        ORDER BY similarity DESC
        LIMIT ${limit}
      `;

      const rawResults = await db.execute(rawQuery);
      const results = rawResults.rows as any[];

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
