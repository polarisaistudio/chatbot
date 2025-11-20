# Polaris AI Support - Project Structure
# 项目结构

**Version**: 1.0
**Last Updated**: 2025-11-20

---

## 1. Directory Structure / 目录结构

```
polaris-ai-support/
├── .github/                      # GitHub workflows and configs
│   └── workflows/
│       └── ci.yml               # CI/CD pipeline (optional)
│
├── public/                       # Static files
│   ├── embed.js                 # Widget loader script
│   ├── test-embed.html          # Test page for widget embedding
│   ├── favicon.ico
│   └── images/
│       └── logo.svg
│
├── src/
│   ├── app/                     # Next.js 14 App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page (landing/info)
│   │   ├── globals.css          # Global styles
│   │   │
│   │   ├── api/                 # API routes
│   │   │   ├── documents/
│   │   │   │   ├── route.ts             # GET all, POST upload
│   │   │   │   ├── upload/
│   │   │   │   │   └── route.ts         # Document upload handler
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts         # GET, DELETE by ID
│   │   │   │
│   │   │   ├── chat/
│   │   │   │   └── route.ts             # POST chat message
│   │   │   │
│   │   │   ├── conversations/
│   │   │   │   ├── route.ts             # GET all conversations
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts         # GET conversation by ID
│   │   │   │
│   │   │   └── analytics/
│   │   │       └── route.ts             # GET analytics data
│   │   │
│   │   ├── admin/               # Admin dashboard
│   │   │   ├── layout.tsx       # Admin layout with nav
│   │   │   ├── page.tsx         # Admin home (redirect to documents)
│   │   │   │
│   │   │   ├── documents/
│   │   │   │   └── page.tsx     # Documents management page
│   │   │   │
│   │   │   ├── conversations/
│   │   │   │   ├── page.tsx     # Conversations list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Conversation detail
│   │   │   │
│   │   │   └── analytics/
│   │   │       └── page.tsx     # Analytics dashboard
│   │   │
│   │   └── widget/              # Chat widget (embeddable)
│   │       ├── layout.tsx       # Minimal layout for widget
│   │       └── page.tsx         # Widget UI
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...              # Other shadcn components
│   │   │
│   │   ├── admin/               # Admin-specific components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── document-upload.tsx
│   │   │   ├── document-list.tsx
│   │   │   ├── document-card.tsx
│   │   │   ├── conversation-list.tsx
│   │   │   ├── conversation-detail.tsx
│   │   │   └── analytics-card.tsx
│   │   │
│   │   └── widget/              # Widget-specific components
│   │       ├── chat-container.tsx
│   │       ├── message-list.tsx
│   │       ├── message-bubble.tsx
│   │       ├── chat-input.tsx
│   │       ├── typing-indicator.tsx
│   │       └── widget-header.tsx
│   │
│   ├── lib/                     # Core business logic
│   │   ├── db/                  # Database
│   │   │   ├── index.ts         # Database connection
│   │   │   ├── schema.ts        # Drizzle schema definitions
│   │   │   └── migrations/      # SQL migrations
│   │   │       └── 0000_init.sql
│   │   │
│   │   ├── parsers/             # Document parsers
│   │   │   ├── index.ts         # Parser factory
│   │   │   ├── pdf-parser.ts    # PDF parsing
│   │   │   ├── text-parser.ts   # TXT parsing
│   │   │   └── markdown-parser.ts # MD parsing
│   │   │
│   │   ├── chunking/            # Text chunking
│   │   │   ├── index.ts
│   │   │   └── text-splitter.ts # Recursive character splitter
│   │   │
│   │   ├── embeddings/          # Embedding generation
│   │   │   ├── index.ts
│   │   │   └── embedding-generator.ts # Transformers.js wrapper
│   │   │
│   │   ├── rag/                 # RAG engine
│   │   │   ├── index.ts
│   │   │   ├── vector-search.ts # Vector similarity search
│   │   │   ├── context-builder.ts # Context assembly
│   │   │   └── query-engine.ts  # Main RAG orchestrator
│   │   │
│   │   ├── llm/                 # LLM integration
│   │   │   ├── index.ts
│   │   │   └── groq-client.ts   # Groq API wrapper
│   │   │
│   │   ├── processing/          # Document processing
│   │   │   ├── index.ts
│   │   │   └── document-processor.ts # Main processing pipeline
│   │   │
│   │   ├── prompts/             # LLM prompts
│   │   │   ├── index.ts
│   │   │   └── templates.ts     # Prompt templates
│   │   │
│   │   ├── validation/          # Input validation
│   │   │   ├── index.ts
│   │   │   └── schemas.ts       # Zod schemas
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   ├── env.ts           # Environment validation
│   │   │   ├── errors.ts        # Error handling
│   │   │   ├── logger.ts        # Logging utility
│   │   │   └── helpers.ts       # General helpers
│   │   │
│   │   └── constants.ts         # App constants
│   │
│   ├── types/                   # TypeScript types
│   │   ├── index.ts
│   │   ├── database.ts          # Database types
│   │   ├── api.ts               # API request/response types
│   │   └── components.ts        # Component prop types
│   │
│   └── hooks/                   # Custom React hooks
│       ├── use-chat.ts          # Chat logic hook
│       ├── use-documents.ts     # Documents CRUD hook
│       ├── use-conversations.ts # Conversations hook
│       └── use-analytics.ts     # Analytics hook
│
├── migrations/                   # Database migrations (if not in lib/db)
│   └── 0000_init.sql
│
├── locales/                     # i18n translation files
│   ├── en.json                  # English translations
│   └── zh.json                  # Chinese translations
│
├── tests/                       # Tests (future)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                        # Additional documentation
│   ├── DESIGN.md               # Technical design (this file created above)
│   ├── DATABASE_SCHEMA.md      # Database schema (created above)
│   ├── ROADMAP.md              # Implementation roadmap (created above)
│   ├── API.md                  # API documentation
│   └── DEPLOYMENT.md           # Deployment guide
│
├── .env.example                # Example environment variables
├── .env.local                  # Local environment variables (gitignored)
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── .gitignore                  # Git ignore rules
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── drizzle.config.ts           # Drizzle ORM configuration
├── package.json                # Dependencies and scripts
├── pnpm-lock.yaml              # pnpm lock file
└── README.md                   # Project README
```

---

## 2. File Descriptions / 文件说明

### 2.1 Core Application Files / 核心应用文件

#### `src/app/api/chat/route.ts`
**Purpose**: Main chat endpoint for RAG queries
**Key Functions**:
- Accept user message
- Generate embeddings
- Perform vector search
- Assemble context
- Call Groq API
- Stream response
- Store conversation

**Example**:
```typescript
export async function POST(req: Request) {
  const { message, sessionId } = await req.json();

  // RAG pipeline
  const embedding = await generateEmbedding(message);
  const chunks = await vectorSearch(embedding);
  const context = assembleContext(chunks);
  const response = await groqClient.chat(context, message);

  // Store and stream
  await storeMessage(sessionId, message, response);
  return streamResponse(response);
}
```

---

#### `src/lib/rag/query-engine.ts`
**Purpose**: Orchestrates the RAG pipeline
**Key Functions**:
- `query(text: string)`: Main entry point
- `retrieveRelevantChunks(embedding: number[])`: Vector search
- `assembleContext(chunks: Chunk[])`: Build LLM context
- `generateResponse(context: string, query: string)`: LLM call

**Example**:
```typescript
export class RAGQueryEngine {
  async query(text: string): Promise<string> {
    const embedding = await this.embeddings.generate(text);
    const chunks = await this.vectorSearch.search(embedding, 5);
    const context = this.contextBuilder.build(chunks);
    const response = await this.llm.generate(context, text);
    return response;
  }
}
```

---

#### `src/lib/processing/document-processor.ts`
**Purpose**: Processes uploaded documents end-to-end
**Key Functions**:
- `processDocument(file: File)`: Main orchestrator
- `parseDocument(file: File)`: Parse to text
- `chunkDocument(text: string)`: Split into chunks
- `generateEmbeddings(chunks: string[])`: Embed chunks
- `storeChunks(chunks: Chunk[])`: Save to database

**Example**:
```typescript
export class DocumentProcessor {
  async processDocument(documentId: string, blobUrl: string) {
    try {
      // Parse
      const text = await this.parser.parse(blobUrl);

      // Chunk
      const chunks = this.splitter.split(text);

      // Embed
      const embeddings = await this.embedder.batchGenerate(chunks);

      // Store
      await this.db.insertChunks(documentId, chunks, embeddings);

      // Update status
      await this.db.updateDocumentStatus(documentId, 'completed');
    } catch (error) {
      await this.db.updateDocumentStatus(documentId, 'failed', error.message);
    }
  }
}
```

---

### 2.2 Component Architecture / 组件架构

#### Admin Components Hierarchy / 管理组件层级

```
AdminLayout
├── Sidebar
│   ├── NavItem (Documents)
│   ├── NavItem (Conversations)
│   └── NavItem (Analytics)
│
└── Main Content
    ├── DocumentsPage
    │   ├── DocumentUpload
    │   └── DocumentList
    │       └── DocumentCard[]
    │
    ├── ConversationsPage
    │   └── ConversationList
    │       └── ConversationCard[]
    │
    └── AnalyticsPage
        ├── AnalyticsCard (Total Docs)
        ├── AnalyticsCard (Total Conversations)
        └── AnalyticsCard (Avg Response Time)
```

#### Widget Components Hierarchy / Widget组件层级

```
WidgetLayout
└── ChatContainer
    ├── WidgetHeader
    ├── MessageList
    │   └── MessageBubble[]
    ├── TypingIndicator
    └── ChatInput
```

---

### 2.3 Database Layer / 数据库层

#### Schema File: `src/lib/db/schema.ts`

```typescript
// Define all tables using Drizzle ORM
export const documents = pgTable('documents', { ... });
export const documentChunks = pgTable('document_chunks', { ... });
export const conversations = pgTable('conversations', { ... });
export const messages = pgTable('messages', { ... });
export const queryAnalytics = pgTable('query_analytics', { ... });

// Define relations
export const documentsRelations = relations(documents, { ... });
// ... more relations
```

#### Database Connection: `src/lib/db/index.ts`

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

---

### 2.4 API Layer / API 层

#### API Route Structure / API 路由结构

```
/api
├── /documents
│   ├── GET     → List all documents
│   ├── POST    → Upload document
│   └── /[id]
│       ├── GET    → Get document by ID
│       └── DELETE → Delete document
│
├── /chat
│   └── POST    → Send message, get AI response
│
├── /conversations
│   ├── GET     → List all conversations
│   └── /[id]
│       └── GET → Get conversation with messages
│
└── /analytics
    └── GET     → Get analytics data
```

---

### 2.5 Shared Types / 共享类型

#### `src/types/database.ts`

```typescript
export interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'txt' | 'md';
  fileSize: number;
  blobUrl: string;
  status: 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  totalChunks: number;
  uploadDate: Date;
  updatedAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkText: string;
  chunkIndex: number;
  embedding: number[];
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  sessionId: string;
  startedAt: Date;
  endedAt?: Date;
  messageCount: number;
  userIp?: string;
  userAgent?: string;
  metadata: Record<string, any>;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata: Record<string, any>;
}
```

---

### 2.6 Configuration Files / 配置文件

#### `drizzle.config.ts`

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

#### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  async headers() {
    return [
      {
        source: '/widget',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

#### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

---

### 2.7 Environment Variables / 环境变量

#### `.env.example`

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# LLM
GROQ_API_KEY=your_groq_api_key

# Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
NODE_ENV=development
```

---

### 2.8 Package.json Scripts / 脚本命令

#### `package.json`

```json
{
  "name": "polaris-ai-support",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "type-check": "tsc --noEmit",
    "format": "prettier --write ."
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18",
    "react-dom": "^18",
    "drizzle-orm": "^0.30.0",
    "@neondatabase/serverless": "^0.9.0",
    "@xenova/transformers": "^2.17.0",
    "groq-sdk": "^0.3.0",
    "@vercel/blob": "^0.22.0",
    "zod": "^3.23.0",
    "lucide-react": "^0.445.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "drizzle-kit": "^0.20.0",
    "eslint": "^8",
    "eslint-config-next": "14.2.0",
    "prettier": "^3.2.0"
  }
}
```

---

## 3. Import Aliases / 导入别名

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  }
}
```

**Usage**:
```typescript
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { RAGQueryEngine } from '@/lib/rag/query-engine';
import type { Document } from '@/types/database';
```

---

## 4. Code Organization Principles / 代码组织原则

### 4.1 Separation of Concerns / 关注点分离

- **API Routes**: Only handle HTTP request/response, delegate to lib
- **Lib**: Core business logic, reusable, framework-agnostic
- **Components**: UI only, no business logic
- **Hooks**: Stateful logic, reusable across components
- **Types**: Centralized type definitions

### 4.2 Naming Conventions / 命名规范

- **Files**: kebab-case (`document-processor.ts`)
- **Components**: PascalCase (`ChatContainer.tsx`)
- **Functions**: camelCase (`generateEmbedding()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CHUNK_SIZE`)
- **Types/Interfaces**: PascalCase (`Document`, `MessageRole`)

### 4.3 File Size Guidelines / 文件大小指南

- Max 300 lines per file (soft limit)
- Split large files into smaller modules
- Use index.ts for clean exports

### 4.4 Import Order / 导入顺序

```typescript
// 1. External dependencies
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Internal lib/utils
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';

// 3. Types
import type { Document } from '@/types/database';

// 4. Local/relative imports
import { DocumentCard } from './document-card';
```

---

## 5. Development Workflow / 开发工作流

### 5.1 Feature Development / 功能开发

1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement changes following structure
3. Test locally
4. Commit with clear message
5. Push and create PR (if team)
6. Merge to main

### 5.2 Adding a New API Endpoint / 添加新 API 端点

1. Create route file: `src/app/api/your-endpoint/route.ts`
2. Define request/response types in `src/types/api.ts`
3. Implement handler using lib functions
4. Add input validation with Zod
5. Test with curl/Postman
6. Document in `docs/API.md`

### 5.3 Adding a New Component / 添加新组件

1. Create component file in appropriate directory
2. Define prop types in file or `src/types/components.ts`
3. Implement component with TypeScript
4. Use Tailwind for styling
5. Export from directory index if needed
6. Import and use in parent component

---

## 6. Testing Structure (Future) / 测试结构（未来）

```
tests/
├── unit/
│   ├── lib/
│   │   ├── chunking.test.ts
│   │   ├── embeddings.test.ts
│   │   └── rag.test.ts
│   └── utils/
│       └── helpers.test.ts
│
├── integration/
│   ├── api/
│   │   ├── documents.test.ts
│   │   └── chat.test.ts
│   └── db/
│       └── operations.test.ts
│
└── e2e/
    ├── document-upload.spec.ts
    ├── chat-flow.spec.ts
    └── widget-embed.spec.ts
```

---

## 7. Build & Deployment / 构建与部署

### 7.1 Build Process / 构建流程

```bash
# Install dependencies
pnpm install

# Type check
pnpm type-check

# Lint
pnpm lint

# Build
pnpm build

# Start production server
pnpm start
```

### 7.2 Vercel Deployment / Vercel 部署

1. Connect GitHub repo to Vercel
2. Configure environment variables
3. Auto-deploy on push to main
4. Preview deployments for PRs

---

## 8. Maintenance & Monitoring / 维护与监控

### 8.1 Logs Location / 日志位置

- **Development**: Console output
- **Production**: Vercel logs dashboard
- **Database**: Neon logs

### 8.2 Key Files to Monitor / 重点监控文件

- `src/lib/llm/groq-client.ts` - API calls
- `src/lib/processing/document-processor.ts` - Processing jobs
- `src/app/api/chat/route.ts` - Chat endpoint
- `src/lib/db/index.ts` - Database connections

---

## 9. Quick Reference / 快速参考

### 9.1 Common Commands / 常用命令

```bash
# Development
pnpm dev

# Database
pnpm db:generate    # Generate migration
pnpm db:push        # Apply migration
pnpm db:studio      # Open Drizzle Studio

# Code quality
pnpm lint           # Lint code
pnpm format         # Format code
pnpm type-check     # Type check

# Build
pnpm build          # Production build
```

### 9.2 Key Directories / 关键目录

- `src/app/api/*` - All API endpoints
- `src/lib/rag/*` - RAG engine
- `src/lib/processing/*` - Document processing
- `src/components/widget/*` - Chat widget UI
- `src/components/admin/*` - Admin dashboard UI

---

## 10. Next Steps / 下一步

After reviewing this structure:

1. ✅ Read DESIGN.md for technical architecture
2. ✅ Read DATABASE_SCHEMA.md for database details
3. ✅ Read ROADMAP.md for implementation plan
4. 🚀 Start implementing Phase 1 from roadmap

**Ready to build! / 准备开始构建！**
