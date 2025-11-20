/**
 * Recursive character text splitter for chunking documents
 */

import { CHUNK_SIZE, CHUNK_OVERLAP } from '@/lib/constants';
import { logger } from '@/lib/utils/logger';

export interface TextChunk {
  text: string;
  index: number;
  metadata: {
    startChar: number;
    endChar: number;
    length: number;
  };
}

export class RecursiveCharacterTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  private separators: string[];

  constructor(
    chunkSize: number = CHUNK_SIZE,
    chunkOverlap: number = CHUNK_OVERLAP
  ) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;

    // Separators in order of preference (try to split on these first)
    this.separators = [
      '\n\n', // Paragraph breaks
      '\n', // Line breaks
      '. ', // Sentences
      '! ',
      '? ',
      '; ',
      ', ', // Clauses
      ' ', // Words
      '', // Characters (last resort)
    ];
  }

  /**
   * Split text into chunks with overlap
   */
  split(text: string): TextChunk[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const chunks: TextChunk[] = [];
    const textChunks = this.recursiveSplit(text, this.separators);

    let currentPosition = 0;

    textChunks.forEach((chunk, index) => {
      const trimmedChunk = chunk.trim();
      if (trimmedChunk.length > 0) {
        chunks.push({
          text: trimmedChunk,
          index,
          metadata: {
            startChar: currentPosition,
            endChar: currentPosition + trimmedChunk.length,
            length: trimmedChunk.length,
          },
        });
        currentPosition += chunk.length;
      }
    });

    logger.info(
      `Split text into ${chunks.length} chunks (avg size: ${Math.round(
        text.length / chunks.length
      )} chars)`,
      {
        context: 'TextSplitter',
        metadata: {
          totalChars: text.length,
          chunks: chunks.length,
          chunkSize: this.chunkSize,
          overlap: this.chunkOverlap,
        },
      }
    );

    return chunks;
  }

  /**
   * Recursively split text using separators
   */
  private recursiveSplit(text: string, separators: string[]): string[] {
    const finalChunks: string[] = [];

    // Use the first available separator
    let separator = separators[separators.length - 1];
    let newSeparators: string[] = [];

    for (let i = 0; i < separators.length; i++) {
      const s = separators[i];
      if (s === '' || text.includes(s)) {
        separator = s;
        newSeparators = separators.slice(i + 1);
        break;
      }
    }

    // Split by the separator
    const splits = separator ? text.split(separator) : [text];

    // Merge splits into chunks
    let currentChunk = '';
    const chunks: string[] = [];

    for (const split of splits) {
      const potentialChunk = currentChunk
        ? currentChunk + separator + split
        : split;

      if (potentialChunk.length <= this.chunkSize) {
        currentChunk = potentialChunk;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = split;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    // Process chunks
    for (const chunk of chunks) {
      if (chunk.length > this.chunkSize && newSeparators.length > 0) {
        // Recursively split if still too large
        finalChunks.push(...this.recursiveSplit(chunk, newSeparators));
      } else {
        finalChunks.push(chunk);
      }
    }

    // Add overlap between chunks
    return this.addOverlap(finalChunks);
  }

  /**
   * Add overlap between consecutive chunks
   */
  private addOverlap(chunks: string[]): string[] {
    if (this.chunkOverlap === 0 || chunks.length <= 1) {
      return chunks;
    }

    const overlappedChunks: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i];

      // Add overlap from previous chunk
      if (i > 0 && this.chunkOverlap > 0) {
        const prevChunk = chunks[i - 1];
        const overlapText = prevChunk.slice(-this.chunkOverlap);
        chunk = overlapText + chunk;
      }

      overlappedChunks.push(chunk);
    }

    return overlappedChunks;
  }

  /**
   * Get chunk statistics
   */
  getStats(chunks: TextChunk[]): {
    totalChunks: number;
    avgChunkSize: number;
    minChunkSize: number;
    maxChunkSize: number;
  } {
    if (chunks.length === 0) {
      return {
        totalChunks: 0,
        avgChunkSize: 0,
        minChunkSize: 0,
        maxChunkSize: 0,
      };
    }

    const sizes = chunks.map((c) => c.text.length);

    return {
      totalChunks: chunks.length,
      avgChunkSize: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length),
      minChunkSize: Math.min(...sizes),
      maxChunkSize: Math.max(...sizes),
    };
  }
}
