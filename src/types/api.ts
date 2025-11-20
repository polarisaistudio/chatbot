/**
 * API request and response type definitions
 */

import type { DocumentStatus, FileType, MessageRole } from './database';

// Document API types
export interface UploadDocumentRequest {
  file: File;
}

export interface UploadDocumentResponse {
  id: string;
  title: string;
  status: DocumentStatus;
  message: string;
}

export interface GetDocumentsResponse {
  documents: Array<{
    id: string;
    title: string;
    fileName: string;
    fileType: FileType;
    fileSize: number;
    status: DocumentStatus;
    totalChunks: number;
    uploadDate: string;
  }>;
  total: number;
}

export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
}

// Chat API types
export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  sources?: Array<{
    documentId: string;
    documentTitle: string;
    chunkText: string;
    similarity: number;
  }>;
  metadata?: {
    responseTimeMs: number;
    chunksRetrieved: number;
  };
}

// Conversation API types
export interface GetConversationsResponse {
  conversations: Array<{
    id: string;
    sessionId: string;
    startedAt: string;
    messageCount: number;
  }>;
  total: number;
}

export interface GetConversationResponse {
  conversation: {
    id: string;
    sessionId: string;
    startedAt: string;
    endedAt?: string;
    messageCount: number;
  };
  messages: Array<{
    id: string;
    role: MessageRole;
    content: string;
    timestamp: string;
  }>;
}

// Analytics API types
export interface GetAnalyticsResponse {
  totalDocuments: number;
  totalConversations: number;
  totalMessages: number;
  averageResponseTime: number;
  successRate: number;
  recentActivity: Array<{
    date: string;
    conversations: number;
    messages: number;
  }>;
}

// Error response
export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}
