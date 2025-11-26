/**
 * RAG Query Engine - Orchestrates retrieval and generation
 */

import { embeddingGenerator } from '@/lib/embeddings';
import { vectorSearch } from './vector-search';
import { groqClient } from '@/lib/llm/groq-client';
import {
  buildChatMessages,
  detectLanguage,
  isGreeting,
  getGreetingResponse,
  isHelpQuery,
  getHelpResponse,
  type ConversationMessage,
} from '@/lib/prompts/templates';
import { matchFAQ, getDefaultResponse } from './faq-matcher';
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
  async query(
    question: string,
    topK: number = 5,
    conversationHistory?: ConversationMessage[]
  ): Promise<QueryResult> {
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

      // Step 1.5: Check if it's a greeting (handle early to avoid unnecessary embedding/search)
      if (isGreeting(question)) {
        logger.info('Detected greeting, responding with greeting', {
          context: 'RAGQueryEngine',
        });
        const totalTime = Date.now() - startTime;
        return {
          answer: getGreetingResponse(language),
          sources: [],
          metadata: {
            queryEmbeddingTime: 0,
            searchTime: 0,
            llmTime: 0,
            totalTime,
            chunksRetrieved: 0,
            language,
          },
        };
      }

      // Step 1.6: Check if it's a help/capabilities query
      if (isHelpQuery(question)) {
        logger.info('Detected help query, responding with capabilities', {
          context: 'RAGQueryEngine',
        });
        const totalTime = Date.now() - startTime;
        return {
          answer: getHelpResponse(language),
          sources: [],
          metadata: {
            queryEmbeddingTime: 0,
            searchTime: 0,
            llmTime: 0,
            totalTime,
            chunksRetrieved: 0,
            language,
          },
        };
      }

      // Step 1.7: Check FAQ database for common questions (fast, no embedding needed)
      const faqMatch = matchFAQ(question);
      if (faqMatch) {
        logger.info('FAQ match found', {
          context: 'RAGQueryEngine',
          metadata: { category: faqMatch.category, confidence: faqMatch.confidence },
        });
        const totalTime = Date.now() - startTime;
        return {
          answer: language === 'zh' ? faqMatch.answerZh : faqMatch.answer,
          sources: [],
          metadata: {
            queryEmbeddingTime: 0,
            searchTime: 0,
            llmTime: 0,
            totalTime,
            chunksRetrieved: 0,
            language,
          },
        };
      }

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
        // No relevant context found - use default response with CTA
        answer = getDefaultResponse(language);
        logger.warn('No relevant context found for query', {
          context: 'RAGQueryEngine',
        });
      } else {
        // Build prompt with context and conversation history
        const messages = buildChatMessages({
          chunks: searchResults,
          question,
          language,
          conversationHistory,
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
    topK: number = 5,
    conversationHistory?: ConversationMessage[]
  ): AsyncGenerator<
    { type: 'chunk'; content: string } | { type: 'metadata'; data: any },
    void,
    unknown
  > {
    const startTime = Date.now();

    try {
      // Detect language
      const language = detectLanguage(question);

      // Check for greeting (skip embedding/search)
      if (isGreeting(question)) {
        yield { type: 'metadata', data: { sources: [], chunksRetrieved: 0, embeddingTime: 0, searchTime: 0 } };
        yield { type: 'chunk', content: getGreetingResponse(language) };
        return;
      }

      // Check for help query (skip embedding/search)
      if (isHelpQuery(question)) {
        yield { type: 'metadata', data: { sources: [], chunksRetrieved: 0, embeddingTime: 0, searchTime: 0 } };
        yield { type: 'chunk', content: getHelpResponse(language) };
        return;
      }

      // Check FAQ database (skip embedding/search)
      const faqMatch = matchFAQ(question);
      if (faqMatch) {
        logger.info('FAQ match found (streaming)', {
          context: 'RAGQueryEngine',
          metadata: { category: faqMatch.category, confidence: faqMatch.confidence },
        });
        yield { type: 'metadata', data: { sources: [], chunksRetrieved: 0, embeddingTime: 0, searchTime: 0 } };
        yield { type: 'chunk', content: language === 'zh' ? faqMatch.answerZh : faqMatch.answer };
        return;
      }

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
          content: getDefaultResponse(language),
        };
      } else {
        const messages = buildChatMessages({
          chunks: searchResults,
          question,
          language,
          conversationHistory,
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
