/**
 * Text file parser (.txt)
 */

import { DocumentProcessingError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export class TextParser {
  /**
   * Parse a text file from URL or Buffer
   */
  async parse(input: string | Buffer): Promise<string> {
    try {
      let content: string;

      if (typeof input === 'string') {
        // If input is a data URL, decode it
        if (input.startsWith('data:')) {
          logger.debug('Decoding data URL', { context: 'TextParser' });
          const base64Data = input.split(',')[1];
          if (!base64Data) {
            throw new Error('Invalid data URL format');
          }
          content = Buffer.from(base64Data, 'base64').toString('utf-8');
        }
        // If input is a URL, fetch it
        else if (input.startsWith('http://') || input.startsWith('https://')) {
          logger.debug('Fetching text file from URL', { context: 'TextParser' });
          const response = await fetch(input);
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
          }
          content = await response.text();
        } else {
          // Otherwise treat as file content
          content = input;
        }
      } else {
        // Parse from Buffer
        content = input.toString('utf-8');
      }

      // Validate content
      if (!content || content.trim().length === 0) {
        throw new Error('Text file is empty');
      }

      // Clean up content
      content = this.cleanText(content);

      logger.info(`Parsed text file: ${content.length} characters`, {
        context: 'TextParser',
      });

      return content;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to parse text file', error as Error, {
        context: 'TextParser',
      });
      throw new DocumentProcessingError(`Text parsing failed: ${message}`);
    }
  }

  /**
   * Clean and normalize text content
   */
  private cleanText(text: string): string {
    return (
      text
        // Normalize line endings
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove excessive whitespace
        .replace(/[ \t]+/g, ' ')
        // Remove excessive newlines (more than 2)
        .replace(/\n{3,}/g, '\n\n')
        // Trim
        .trim()
    );
  }
}
