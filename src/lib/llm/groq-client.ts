/**
 * Groq LLM client for chat completions
 */

import Groq from 'groq-sdk';
import { GROQ_MODEL, MAX_TOKENS, TEMPERATURE } from '@/lib/constants';
import { LLMError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { env } from '@/lib/utils/env';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export class GroqClient {
  private client: Groq;
  private model: string;

  constructor() {
    const apiKey = env.GROQ_API_KEY();
    if (!apiKey) {
      throw new LLMError('GROQ_API_KEY is not configured');
    }

    this.client = new Groq({ apiKey });
    this.model = GROQ_MODEL;

    logger.info('Groq client initialized', {
      context: 'GroqClient',
      metadata: { model: this.model },
    });
  }

  /**
   * Generate chat completion (non-streaming)
   */
  async complete(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    try {
      const startTime = Date.now();

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: options.temperature ?? TEMPERATURE,
        max_tokens: options.maxTokens ?? MAX_TOKENS,
        stream: false,
      });

      const content = response.choices[0]?.message?.content || '';
      const duration = Date.now() - startTime;

      logger.info(
        `Chat completion generated in ${duration}ms (${response.usage?.total_tokens} tokens)`,
        {
          context: 'GroqClient',
          metadata: {
            model: response.model,
            tokens: response.usage,
            duration,
          },
        }
      );

      return content;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Chat completion failed', error as Error, {
        context: 'GroqClient',
      });
      throw new LLMError(`Chat completion failed: ${message}`);
    }
  }

  /**
   * Generate streaming chat completion
   */
  async *completeStream(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    try {
      const startTime = Date.now();

      logger.debug('Starting streaming chat completion', {
        context: 'GroqClient',
      });

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: options.temperature ?? TEMPERATURE,
        max_tokens: options.maxTokens ?? MAX_TOKENS,
        stream: true,
      });

      let totalChunks = 0;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          totalChunks++;
          yield content;
        }
      }

      const duration = Date.now() - startTime;

      logger.info(`Streaming completed in ${duration}ms (${totalChunks} chunks)`, {
        context: 'GroqClient',
        metadata: {
          chunks: totalChunks,
          duration,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Streaming chat completion failed', error as Error, {
        context: 'GroqClient',
      });
      throw new LLMError(`Streaming completion failed: ${message}`);
    }
  }

  /**
   * Get model info
   */
  getModelInfo() {
    return {
      model: this.model,
      temperature: TEMPERATURE,
      maxTokens: MAX_TOKENS,
    };
  }
}

// Export singleton instance
export const groqClient = new GroqClient();
