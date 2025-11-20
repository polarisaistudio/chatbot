/**
 * Embedding generator using Transformers.js
 */

import { pipeline, env } from '@xenova/transformers';
import { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from '@/lib/constants';
import { EmbeddingError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

export class EmbeddingGenerator {
  private static instance: EmbeddingGenerator;
  private pipe: any = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): EmbeddingGenerator {
    if (!EmbeddingGenerator.instance) {
      EmbeddingGenerator.instance = new EmbeddingGenerator();
    }
    return EmbeddingGenerator.instance;
  }

  /**
   * Initialize the embedding model
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // If initialization is already in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInitialize();
    await this.initPromise;
    this.initPromise = null;
  }

  private async doInitialize(): Promise<void> {
    try {
      logger.info(`Initializing embedding model: ${EMBEDDING_MODEL}`, {
        context: 'EmbeddingGenerator',
      });

      const startTime = Date.now();

      this.pipe = await pipeline('feature-extraction', EMBEDDING_MODEL);

      const duration = Date.now() - startTime;

      this.isInitialized = true;

      logger.info(`Embedding model initialized in ${duration}ms`, {
        context: 'EmbeddingGenerator',
        metadata: {
          model: EMBEDDING_MODEL,
          dimensions: EMBEDDING_DIMENSIONS,
        },
      });
    } catch (error) {
      this.isInitialized = false;
      this.pipe = null;
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to initialize embedding model', error as Error, {
        context: 'EmbeddingGenerator',
      });
      throw new EmbeddingError(`Model initialization failed: ${message}`);
    }
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    await this.initialize();

    if (!this.pipe) {
      throw new EmbeddingError('Embedding model not initialized');
    }

    try {
      const startTime = Date.now();

      // Generate embedding
      const output = await this.pipe(text, {
        pooling: 'mean',
        normalize: true,
      });

      // Convert to array
      const embedding = Array.from(output.data) as number[];

      const duration = Date.now() - startTime;

      logger.debug(`Generated embedding in ${duration}ms`, {
        context: 'EmbeddingGenerator',
        metadata: {
          textLength: text.length,
          dimensions: embedding.length,
        },
      });

      // Validate dimensions
      if (embedding.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(
          `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`
        );
      }

      return embedding;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to generate embedding', error as Error, {
        context: 'EmbeddingGenerator',
      });
      throw new EmbeddingError(`Embedding generation failed: ${message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts (batch processing)
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    logger.info(`Generating embeddings for ${texts.length} texts`, {
      context: 'EmbeddingGenerator',
    });

    const startTime = Date.now();
    const embeddings: number[][] = [];

    // Process in batches to avoid memory issues
    const batchSize = 10;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchEmbeddings = await Promise.all(
        batch.map((text) => this.generateEmbedding(text))
      );
      embeddings.push(...batchEmbeddings);

      logger.debug(
        `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          texts.length / batchSize
        )}`,
        {
          context: 'EmbeddingGenerator',
        }
      );
    }

    const duration = Date.now() - startTime;

    logger.info(
      `Generated ${embeddings.length} embeddings in ${duration}ms (avg: ${Math.round(
        duration / embeddings.length
      )}ms each)`,
      {
        context: 'EmbeddingGenerator',
      }
    );

    return embeddings;
  }

  /**
   * Check if model is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.pipe !== null;
  }

  /**
   * Get model info
   */
  getModelInfo(): {
    model: string;
    dimensions: number;
    initialized: boolean;
  } {
    return {
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
      initialized: this.isInitialized,
    };
  }
}

// Export singleton instance
export const embeddingGenerator = EmbeddingGenerator.getInstance();
