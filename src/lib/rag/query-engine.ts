/**
 * RAG Query Engine - Orchestrates retrieval and generation
 */

import { embeddingGenerator } from '@/lib/embeddings';
import { vectorSearch } from './vector-search';
import { groqClient } from '@/lib/llm/groq-client';
import {
  buildChatMessages,
  detectLanguage,
  getFallbackResponse,
} from '@/lib/prompts/templates';
import { logger } from '@/lib/utils/logger';
import type { SearchResult } from './vector-search';

export interface QueryResult {
  answer: string;
  sources: SearchResult[];
  metadata: {
    queryEmbeddingTime: number;
    searchTime: number;
    llmTime: number;
    totalTime: number;
    chunksRetrieved: number;
    language: 'en' | 'zh';
  };
}

export class RAGQueryEngine {
  /**
   * Query the RAG system with a user question
   */
  async query(question: string, topK: number = 5): Promise<QueryResult> {
    const startTime = Date.now();
    logger.info('Starting RAG query', {
      context: 'RAGQueryEngine',
      metadata: { question: question.substring(0, 100) },
    });

    try {
      // Step 1: Detect language
      const language = detectLanguage(question);
      logger.debug(`Detected language: ${language}`, {
        context: 'RAGQueryEngine',
      });

      // Step 2: Generate query embedding
      const embeddingStart = Date.now();
      const queryEmbedding = await embeddingGenerator.generateEmbedding(question);
      const embeddingTime = Date.now() - embeddingStart;

      logger.debug(`Query embedding generated in ${embeddingTime}ms`, {
        context: 'RAGQueryEngine',
      });

      // Step 3: Search for relevant chunks
      const searchStart = Date.now();
      const searchResults = await vectorSearch.search(queryEmbedding, topK);
      const searchTime = Date.now() - searchStart;

      logger.info(
        `Found ${searchResults.length} relevant chunks in ${searchTime}ms`,
        {
          context: 'RAGQueryEngine',
          metadata: {
            results: searchResults.length,
            avgSimilarity:
              searchResults.length > 0
                ? (
                    searchResults.reduce((sum, r) => sum + r.similarity, 0) /
                    searchResults.length
                  ).toFixed(3)
                : 0,
          },
        }
      );

      // Step 4: Generate answer with LLM
      let answer: string;
      const llmStart = Date.now();

      if (searchResults.length === 0) {
        // No relevant context found
        answer = getFallbackResponse(language);
        logger.warn('No relevant context found for query', {
          context: 'RAGQueryEngine',
        });
      } else {
        // Build prompt with context
        const messages = buildChatMessages({
          chunks: searchResults,
          question,
          language,
        });

        // Generate answer
        answer = await groqClient.complete(messages);
      }

      const llmTime = Date.now() - llmStart;
      const totalTime = Date.now() - startTime;

      logger.info(`RAG query completed in ${totalTime}ms`, {
        context: 'RAGQueryEngine',
        metadata: {
          embeddingTime,
          searchTime,
          llmTime,
          totalTime,
          chunksRetrieved: searchResults.length,
        },
      });

      return {
        answer,
        sources: searchResults,
        metadata: {
          queryEmbeddingTime: embeddingTime,
          searchTime,
          llmTime,
          totalTime,
          chunksRetrieved: searchResults.length,
          language,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('RAG query failed', error as Error, {
        context: 'RAGQueryEngine',
      });
      throw new Error(`RAG query failed: ${message}`);
    }
  }

  /**
   * Query with streaming response
   */
  async *queryStream(
    question: string,
    topK: number = 5
  ): AsyncGenerator<
    { type: 'chunk'; content: string } | { type: 'metadata'; data: any },
    void,
    unknown
  > {
    const startTime = Date.now();

    try {
      // Detect language
      const language = detectLanguage(question);

      // Generate embedding
      const embeddingStart = Date.now();
      const queryEmbedding = await embeddingGenerator.generateEmbedding(question);
      const embeddingTime = Date.now() - embeddingStart;

      // Search for chunks
      const searchStart = Date.now();
      const searchResults = await vectorSearch.search(queryEmbedding, topK);
      const searchTime = Date.now() - searchStart;

      // Yield metadata first
      yield {
        type: 'metadata',
        data: {
          sources: searchResults,
          chunksRetrieved: searchResults.length,
          embeddingTime,
          searchTime,
        },
      };

      // Stream answer
      if (searchResults.length === 0) {
        yield {
          type: 'chunk',
          content: getFallbackResponse(language),
        };
      } else {
        const messages = buildChatMessages({
          chunks: searchResults,
          question,
          language,
        });

        const llmStart = Date.now();

        for await (const chunk of groqClient.completeStream(messages)) {
          yield {
            type: 'chunk',
            content: chunk,
          };
        }

        const llmTime = Date.now() - llmStart;
        const totalTime = Date.now() - startTime;

        logger.info(`Streaming RAG query completed in ${totalTime}ms`, {
          context: 'RAGQueryEngine',
          metadata: {
            embeddingTime,
            searchTime,
            llmTime,
            totalTime,
          },
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Streaming RAG query failed', error as Error, {
        context: 'RAGQueryEngine',
      });
      throw new Error(`Streaming RAG query failed: ${message}`);
    }
  }
}

// Export singleton instance
export const ragQueryEngine = new RAGQueryEngine();
