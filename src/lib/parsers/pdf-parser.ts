/**
 * PDF file parser (.pdf)
 */

import pdf from 'pdf-parse';
import { DocumentProcessingError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export class PDFParser {
  /**
   * Parse a PDF file from URL or Buffer
   */
  async parse(input: string | Buffer): Promise<string> {
    try {
      let buffer: Buffer;

      if (typeof input === 'string') {
        // If input is a data URL, decode it
        if (input.startsWith('data:')) {
          logger.debug('Decoding data URL', { context: 'PDFParser' });
          const base64Data = input.split(',')[1];
          if (!base64Data) {
            throw new Error('Invalid data URL format');
          }
          buffer = Buffer.from(base64Data, 'base64');
        }
        // If input is a URL, fetch it
        else if (input.startsWith('http://') || input.startsWith('https://')) {
          logger.debug('Fetching PDF file from URL', { context: 'PDFParser' });
          const response = await fetch(input);
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
        } else {
          throw new Error('PDF parser requires a URL or Buffer');
        }
      } else {
        buffer = input;
      }

      // Parse PDF
      logger.debug('Parsing PDF with pdf-parse', { context: 'PDFParser' });
      const data = await pdf(buffer);

      // Validate content
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('PDF contains no extractable text');
      }

      // Clean up extracted text
      const content = this.cleanPDFText(data.text);

      logger.info(
        `Parsed PDF: ${data.numpages} pages, ${content.length} characters`,
        {
          context: 'PDFParser',
          metadata: {
            pages: data.numpages,
            info: data.info,
          },
        }
      );

      return content;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to parse PDF file', error as Error, {
        context: 'PDFParser',
      });
      throw new DocumentProcessingError(`PDF parsing failed: ${message}`);
    }
  }

  /**
   * Clean and normalize PDF extracted text
   */
  private cleanPDFText(text: string): string {
    return (
      text
        // Normalize line endings
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove excessive whitespace
        .replace(/[ \t]+/g, ' ')
        // Remove form feed characters
        .replace(/\f/g, '')
        // Remove excessive newlines (more than 2)
        .replace(/\n{3,}/g, '\n\n')
        // Fix hyphenated words at line breaks
        .replace(/(\w+)-\n(\w+)/g, '$1$2')
        // Trim each line
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        // Trim overall
        .trim()
    );
  }
}
