import { pgTable, uuid, varchar, integer, text, timestamp, boolean, jsonb, customType } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Custom vector type for pgvector
const vector = customType<{ data: number[]; config: { dimensions: number } }>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 384})`;
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: unknown): number[] {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value as number[];
  },
});

// Documents table - stores metadata about uploaded knowledge base documents
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 10 }).notNull(),
  fileSize: integer('file_size').notNull(),
  blobUrl: text('blob_url').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('processing'),
  errorMessage: text('error_message'),
  totalChunks: integer('total_chunks').default(0),
  uploadDate: timestamp('upload_date', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Document chunks table - stores text chunks and their vector embeddings
export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  chunkText: text('chunk_text').notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  embedding: vector('embedding', { dimensions: 384 }),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Conversations table - stores conversation sessions
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: varchar('session_id', { length: 100 }).notNull().unique(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  messageCount: integer('message_count').default(0),
  userIp: varchar('user_ip', { length: 45 }),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
});

// Messages table - stores individual messages within conversations
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
});

// Query analytics table - stores query performance analytics
export const queryAnalytics = pgTable('query_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  queryText: text('query_text').notNull(),
  responseTimeMs: integer('response_time_ms').notNull(),
  chunksRetrieved: integer('chunks_retrieved').notNull(),
  success: boolean('success').notNull().default(true),
  errorMessage: text('error_message'),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
});

// Admin users table - stores admin user credentials
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 20 }).notNull().default('admin'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Feedback table - stores user feedback for messages
export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1 for thumbs up, -1 for thumbs down
  comment: text('comment'),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const documentsRelations = relations(documents, ({ many }) => ({
  chunks: many(documentChunks),
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  feedback: many(feedback),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  message: one(messages, {
    fields: [feedback.messageId],
    references: [messages.id],
  }),
  conversation: one(conversations, {
    fields: [feedback.conversationId],
    references: [conversations.id],
  }),
}));
