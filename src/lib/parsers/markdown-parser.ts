/**
 * Markdown file parser (.md)
 */

import { DocumentProcessingError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export class MarkdownParser {
  /**
   * Parse a markdown file from URL or Buffer
   */
  async parse(input: string | Buffer): Promise<string> {
    try {
      let content: string;

      if (typeof input === 'string') {
        // If input is a data URL, decode it
        if (input.startsWith('data:')) {
          logger.debug('Decoding data URL', { context: 'MarkdownParser' });
          const base64Data = input.split(',')[1];
          if (!base64Data) {
            throw new Error('Invalid data URL format');
          }
          content = Buffer.from(base64Data, 'base64').toString('utf-8');
        }
        // If input is a URL, fetch it
        else if (input.startsWith('http://') || input.startsWith('https://')) {
          logger.debug('Fetching markdown file from URL', {
            context: 'MarkdownParser',
          });
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
        throw new Error('Markdown file is empty');
      }

      // Clean up markdown content
      content = this.cleanMarkdown(content);

      logger.info(`Parsed markdown file: ${content.length} characters`, {
        context: 'MarkdownParser',
      });

      return content;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to parse markdown file', error as Error, {
        context: 'MarkdownParser',
      });
      throw new DocumentProcessingError(`Markdown parsing failed: ${message}`);
    }
  }

  /**
   * Clean and normalize markdown content
   * Preserves structure but removes excessive formatting
   */
  private cleanMarkdown(text: string): string {
    return (
      text
        // Normalize line endings
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove excessive whitespace
        .replace(/[ \t]+/g, ' ')
        // Normalize heading spacing
        .replace(/^(#{1,6})\s+/gm, '$1 ')
        // Remove excessive newlines (more than 2)
        .replace(/\n{3,}/g, '\n\n')
        // Trim
        .trim()
    );
  }
}
