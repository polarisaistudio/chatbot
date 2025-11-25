// File upload constraints
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['pdf', 'txt', 'md'] as const;
export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

// Text chunking configuration
export const CHUNK_SIZE = 1000; // characters
export const CHUNK_OVERLAP = 200; // characters

// Embedding configuration
export const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
export const EMBEDDING_DIMENSIONS = 384;

// RAG configuration
export const TOP_K_CHUNKS = 5; // Number of chunks to retrieve
export const MIN_SIMILARITY_SCORE = 0.3; // Lowered to capture more results for short queries

// LLM configuration
export const GROQ_MODEL = 'llama-3.3-70b-versatile';
export const MAX_TOKENS = 1024;
export const TEMPERATURE = 0.7;

// Rate limiting
export const RATE_LIMIT_REQUESTS = 20; // requests per window
export const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in ms

// Message constraints
export const MAX_MESSAGE_LENGTH = 500;
export const MAX_CONVERSATION_MESSAGES = 50;

// Document processing
export const PROCESSING_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// API endpoints
export const API_ROUTES = {
  DOCUMENTS: '/api/documents',
  DOCUMENTS_UPLOAD: '/api/documents/upload',
  CHAT: '/api/chat',
  CONVERSATIONS: '/api/conversations',
  ANALYTICS: '/api/analytics',
} as const;
