# Polaris AI Support - Database Schema Design
# 数据库架构设计

**Version**: 1.0
**Last Updated**: 2025-11-20
**Database**: PostgreSQL 15+ with pgvector extension

---

## 1. Overview / 概述

This document defines the database schema for Polaris AI Support. The system uses Neon Postgres with the pgvector extension for storing documents, embeddings, and conversation history.

本文档定义了 Polaris AI Support 的数据库架构。系统使用 Neon Postgres 和 pgvector 扩展来存储文档、向量嵌入和对话历史。

---

## 2. Schema Diagram / 架构图

```
┌─────────────────────┐
│     documents       │
│---------------------|
│ id (PK)             │
│ title               │
│ file_name           │
│ file_type           │
│ file_size           │
│ blob_url            │
│ status              │
│ upload_date         │
│ updated_at          │
└──────────┬──────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────┐
│   document_chunks   │
│---------------------|
│ id (PK)             │
│ document_id (FK)    │
│ chunk_text          │
│ chunk_index         │
│ embedding (vector)  │───── pgvector extension
│ metadata            │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐
│   conversations     │
│---------------------|
│ id (PK)             │
│ session_id          │
│ started_at          │
│ ended_at            │
│ message_count       │
│ user_ip             │
│ user_agent          │
└──────────┬──────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────┐
│      messages       │
│---------------------|
│ id (PK)             │
│ conversation_id (FK)│
│ role                │
│ content             │
│ timestamp           │
│ metadata            │
└─────────────────────┘

┌─────────────────────┐
│   query_analytics   │
│---------------------|
│ id (PK)             │
│ query_text          │
│ response_time_ms    │
│ chunks_retrieved    │
│ success             │
│ error_message       │
│ timestamp           │
└─────────────────────┘
```

---

## 3. Table Definitions / 表定义

### 3.1 documents

Stores metadata about uploaded knowledge base documents.

存储上传的知识库文档的元数据。

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('pdf', 'txt', 'md')),
  file_size INTEGER NOT NULL,
  blob_url TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  total_chunks INTEGER DEFAULT 0,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_upload_date ON documents(upload_date DESC);
```

**Fields / 字段:**

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key / 主键 |
| title | VARCHAR(255) | Document title / 文档标题 |
| file_name | VARCHAR(255) | Original file name / 原始文件名 |
| file_type | VARCHAR(10) | File type: pdf, txt, md / 文件类型 |
| file_size | INTEGER | File size in bytes / 文件大小（字节）|
| blob_url | TEXT | Vercel Blob storage URL / 存储URL |
| status | VARCHAR(20) | Processing status / 处理状态 |
| error_message | TEXT | Error details if failed / 错误信息 |
| total_chunks | INTEGER | Number of chunks created / 分块数量 |
| upload_date | TIMESTAMPTZ | Upload timestamp / 上传时间 |
| updated_at | TIMESTAMPTZ | Last update time / 更新时间 |

---

### 3.2 document_chunks

Stores text chunks and their vector embeddings for RAG retrieval.

存储文本分块和向量嵌入，用于 RAG 检索。

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(384),  -- 384 dimensions for all-MiniLM-L6-v2
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_document_chunk UNIQUE(document_id, chunk_index)
);

-- Indexes for vector similarity search
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_embedding ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Full-text search index (optional, for hybrid search)
CREATE INDEX idx_document_chunks_text ON document_chunks
  USING gin(to_tsvector('english', chunk_text));
```

**Fields / 字段:**

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key / 主键 |
| document_id | UUID | Foreign key to documents / 文档外键 |
| chunk_text | TEXT | The actual text chunk / 文本分块内容 |
| chunk_index | INTEGER | Order in original document / 在原文档中的顺序 |
| embedding | vector(384) | 384-dim embedding vector / 384维向量嵌入 |
| metadata | JSONB | Additional metadata (page number, etc.) / 额外元数据 |
| created_at | TIMESTAMPTZ | Creation timestamp / 创建时间 |

**Vector Search Example / 向量搜索示例:**

```sql
-- Find top 5 most similar chunks
SELECT
  dc.chunk_text,
  dc.metadata,
  d.title as document_title,
  1 - (dc.embedding <=> $1) as similarity
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id
WHERE d.status = 'completed'
ORDER BY dc.embedding <=> $1
LIMIT 5;
```

---

### 3.3 conversations

Stores conversation sessions for analytics and history.

存储对话会话，用于分析和历史记录。

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) UNIQUE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  user_ip VARCHAR(45),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_started_at ON conversations(started_at DESC);
```

**Fields / 字段:**

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key / 主键 |
| session_id | VARCHAR(100) | Unique session identifier / 会话唯一标识 |
| started_at | TIMESTAMPTZ | Conversation start time / 对话开始时间 |
| ended_at | TIMESTAMPTZ | Conversation end time / 对话结束时间 |
| message_count | INTEGER | Total messages in conversation / 消息总数 |
| user_ip | VARCHAR(45) | User IP address (anonymized) / 用户IP |
| user_agent | TEXT | Browser user agent / 浏览器信息 |
| metadata | JSONB | Additional data / 额外数据 |

---

### 3.4 messages

Stores individual messages within conversations.

存储对话中的单条消息。

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
```

**Fields / 字段:**

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key / 主键 |
| conversation_id | UUID | Foreign key to conversations / 对话外键 |
| role | VARCHAR(20) | Message role: user/assistant/system / 角色 |
| content | TEXT | Message content / 消息内容 |
| timestamp | TIMESTAMPTZ | Message timestamp / 消息时间 |
| metadata | JSONB | Retrieved chunks, response time, etc. / 元数据 |

**Metadata Example / 元数据示例:**

```json
{
  "chunks_used": 3,
  "response_time_ms": 1250,
  "model": "llama3-70b-8192",
  "chunk_ids": ["uuid1", "uuid2", "uuid3"]
}
```

---

### 3.5 query_analytics

Stores query performance analytics for monitoring.

存储查询性能分析数据。

```sql
CREATE TABLE query_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  response_time_ms INTEGER NOT NULL,
  chunks_retrieved INTEGER NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_query_analytics_timestamp ON query_analytics(timestamp DESC);
CREATE INDEX idx_query_analytics_success ON query_analytics(success);
```

**Fields / 字段:**

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key / 主键 |
| query_text | TEXT | User's query / 用户查询 |
| response_time_ms | INTEGER | Total response time / 响应时间 |
| chunks_retrieved | INTEGER | Number of chunks retrieved / 检索块数 |
| success | BOOLEAN | Query success status / 查询成功状态 |
| error_message | TEXT | Error details if failed / 错误详情 |
| timestamp | TIMESTAMPTZ | Query timestamp / 查询时间 |
| metadata | JSONB | Additional metrics / 额外指标 |

---

## 4. Database Initialization / 数据库初始化

### 4.1 Setup Script

Create a migration file: `migrations/0000_init.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tables in order (respecting foreign keys)
-- (Insert all CREATE TABLE statements from above)

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to documents table
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 5. Drizzle ORM Schema / Drizzle ORM 架构

Create schema file: `lib/db/schema.ts`

```typescript
import { pgTable, uuid, varchar, integer, text,
         timestamp, boolean, jsonb, vector } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Documents table
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

// Document chunks table
export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  chunkText: text('chunk_text').notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  embedding: vector('embedding', { dimensions: 384 }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Conversations table
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: varchar('session_id', { length: 100 }).notNull().unique(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  messageCount: integer('message_count').default(0),
  userIp: varchar('user_ip', { length: 45 }),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata').default({}),
});

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb('metadata').default({}),
});

// Query analytics table
export const queryAnalytics = pgTable('query_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  queryText: text('query_text').notNull(),
  responseTimeMs: integer('response_time_ms').notNull(),
  chunksRetrieved: integer('chunks_retrieved').notNull(),
  success: boolean('success').notNull().default(true),
  errorMessage: text('error_message'),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb('metadata').default({}),
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

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));
```

---

## 6. Common Queries / 常用查询

### 6.1 Get All Documents with Chunk Count

```sql
SELECT
  d.*,
  COUNT(dc.id) as actual_chunk_count
FROM documents d
LEFT JOIN document_chunks dc ON d.id = dc.document_id
GROUP BY d.id
ORDER BY d.upload_date DESC;
```

### 6.2 Semantic Search

```sql
-- $1 is the query embedding vector
SELECT
  dc.chunk_text,
  dc.metadata,
  d.title,
  d.file_name,
  (1 - (dc.embedding <=> $1)) as similarity
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id
WHERE d.status = 'completed'
ORDER BY dc.embedding <=> $1
LIMIT 5;
```

### 6.3 Get Conversation with Messages

```sql
SELECT
  c.*,
  json_agg(
    json_build_object(
      'id', m.id,
      'role', m.role,
      'content', m.content,
      'timestamp', m.timestamp
    ) ORDER BY m.timestamp
  ) as messages
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.session_id = $1
GROUP BY c.id;
```

### 6.4 Analytics: Average Response Time

```sql
SELECT
  DATE(timestamp) as date,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) as total_queries,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_queries
FROM query_analytics
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

---

## 7. Data Retention / 数据保留

### 7.1 MVP Retention Policy

- **Documents**: Keep indefinitely
- **Conversations**: Keep for 90 days
- **Messages**: Keep for 90 days
- **Query Analytics**: Keep for 30 days

### 7.2 Cleanup Script (Future)

```sql
-- Delete old conversations
DELETE FROM conversations
WHERE started_at < NOW() - INTERVAL '90 days';

-- Delete old analytics
DELETE FROM query_analytics
WHERE timestamp < NOW() - INTERVAL '30 days';
```

---

## 8. Backup & Recovery / 备份和恢复

### 8.1 Neon Automated Backups

Neon provides automated backups:
- Point-in-time recovery
- Automatic daily snapshots
- Retained for 7 days (free tier)

### 8.2 Manual Backup

```bash
# Export schema
pg_dump -s $DATABASE_URL > schema.sql

# Export data
pg_dump $DATABASE_URL > full_backup.sql
```

---

## 9. Performance Tuning / 性能调优

### 9.1 Vector Index Optimization

```sql
-- Adjust lists parameter based on data size
-- Rule of thumb: lists = sqrt(total_rows)
CREATE INDEX idx_document_chunks_embedding ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- For better accuracy with more data
DROP INDEX idx_document_chunks_embedding;
CREATE INDEX idx_document_chunks_embedding ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 200);
```

### 9.2 Query Optimization

- Use `EXPLAIN ANALYZE` to check query plans
- Add indexes for frequently queried columns
- Consider materialized views for analytics

---

## 10. Migration Strategy / 迁移策略

### 10.1 Tools

- **Drizzle Kit**: For schema migrations
- **SQL Files**: For custom migrations

### 10.2 Migration Workflow

```bash
# Generate migration
pnpm drizzle-kit generate:pg

# Apply migration
pnpm drizzle-kit push:pg

# Check migration status
pnpm drizzle-kit check:pg
```

---

## Appendix A: Vector Search Distance Metrics / 附录A: 向量搜索距离指标

pgvector supports three distance operators:

| Operator | Distance Type | Use Case |
|----------|---------------|----------|
| `<->` | L2 (Euclidean) | General purpose |
| `<=>` | Cosine distance | Text embeddings (recommended) |
| `<#>` | Inner product | Pre-normalized vectors |

For this project, we use **cosine distance** (`<=>`) as it's most suitable for text embeddings.

---

## Appendix B: Storage Estimates / 附录B: 存储估算

Estimated storage per document (average):

- **Document metadata**: ~1 KB
- **Chunks (500 words each)**: ~3 KB per chunk
- **Embeddings (384-dim)**: ~1.5 KB per chunk
- **Total per 1000-word doc**: ~10-15 KB

For Neon free tier (500 MB):
- Estimated capacity: **30,000 - 50,000 document chunks**
- Or approximately: **100-200 PDF documents** (depending on size)
