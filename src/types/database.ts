/**
 * Database type definitions
 */

export type DocumentStatus = 'processing' | 'completed' | 'failed';
export type MessageRole = 'user' | 'assistant' | 'system';
export type FileType = 'pdf' | 'txt' | 'md';

export interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  blobUrl: string;
  status: DocumentStatus;
  errorMessage?: string | null;
  totalChunks: number;
  uploadDate: Date;
  updatedAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkText: string;
  chunkIndex: number;
  embedding: number[] | null;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  sessionId: string;
  startedAt: Date;
  endedAt?: Date | null;
  messageCount: number;
  userIp?: string | null;
  userAgent?: string | null;
  metadata: Record<string, any>;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface QueryAnalytics {
  id: string;
  queryText: string;
  responseTimeMs: number;
  chunksRetrieved: number;
  success: boolean;
  errorMessage?: string | null;
  timestamp: Date;
  metadata: Record<string, any>;
}
