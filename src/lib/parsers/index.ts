/**
 * Document parser factory
 */

import { PDFParser } from './pdf-parser';
import { TextParser } from './text-parser';
import { MarkdownParser } from './markdown-parser';
import { getFileExtension } from '@/lib/utils/helpers';
import { ValidationError } from '@/lib/utils/errors';
import type { FileType } from '@/types';

export class DocumentParser {
  private pdfParser = new PDFParser();
  private textParser = new TextParser();
  private markdownParser = new MarkdownParser();

  /**
   * Parse a document based on its file type
   */
  async parse(input: string | Buffer, fileType?: FileType): Promise<string> {
    // Determine file type if not provided
    if (!fileType) {
      if (typeof input === 'string') {
        fileType = getFileExtension(input) as FileType;
      } else {
        throw new ValidationError('File type must be specified for Buffer input');
      }
    }

    // Route to appropriate parser
    switch (fileType) {
      case 'pdf':
        return this.pdfParser.parse(input);
      case 'txt':
        return this.textParser.parse(input);
      case 'md':
        return this.markdownParser.parse(input);
      default:
        throw new ValidationError(`Unsupported file type: ${fileType}`);
    }
  }

  /**
   * Parse a document from a URL
   */
  async parseFromUrl(url: string, fileType: FileType): Promise<string> {
    return this.parse(url, fileType);
  }

  /**
   * Parse a document from a Buffer
   */
  async parseFromBuffer(buffer: Buffer, fileType: FileType): Promise<string> {
    return this.parse(buffer, fileType);
  }
}

// Export parsers
export { PDFParser, TextParser, MarkdownParser };
