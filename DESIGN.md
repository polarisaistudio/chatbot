# Polaris AI Support - Technical Design Document
# 技术设计文档

**Version**: 1.0
**Last Updated**: 2025-11-20
**Status**: Draft

---

## 1. Executive Summary / 执行摘要

Polaris AI Support is an embeddable AI-powered customer service chatbot that uses RAG (Retrieval-Augmented Generation) technology to provide intelligent responses based on uploaded knowledge base documents. The system will be deployed on free-tier infrastructure and serve as a demo on polarisaistudio.com.

Polaris AI Support 是一个可嵌入的 AI 智能客服聊天机器人，使用 RAG 技术基于上传的知识库文档提供智能回答。系统将部署在免费基础设施上，并作为 Demo 嵌入 Polaris 官网。

---

## 2. System Architecture / 系统架构

### 2.1 High-Level Architecture / 高层架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Customer Website                          │
│                      (任何客户网站)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Embeddable Chat Widget (iframe/script)        │   │
│  │              可嵌入聊天组件                           │   │
│  └────────────────────┬─────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Polaris AI Support Platform                     │
│                   (Vercel Deployment)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Next.js 14 Application                    │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │ Widget API   │  │  Admin UI    │  │ Chat API │ │    │
│  │  │ /widget/*    │  │  /admin/*    │  │ /api/*   │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │        RAG Processing Layer                   │  │    │
│  │  │  • Document Chunking                          │  │    │
│  │  │  • Embedding Generation (sentence-transformers) │  │
│  │  │  • Vector Search                              │  │    │
│  │  │  • Context Assembly                           │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│         │                    │                    │          │
│         ▼                    ▼                    ▼          │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐     │
│  │  Groq    │        │   Neon   │        │  Vercel  │     │
│  │   API    │        │ Postgres │        │   Blob   │     │
│  │ (Llama3) │        │(pgvector)│        │ Storage  │     │
│  └──────────┘        └──────────┘        └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack / 技术栈

#### Frontend / 前端
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context / Zustand (lightweight)
- **Language**: TypeScript
- **Icons**: Lucide React

#### Backend / 后端
- **Runtime**: Next.js API Routes (Edge Runtime for speed)
- **ORM**: Drizzle ORM (lightweight, type-safe)
- **File Upload**: Vercel Blob Storage
- **Document Processing**:
  - PDF: pdf-parse or pdf.js
  - TXT/MD: Native Node.js fs
- **Embeddings**: @xenova/transformers (runs in Node.js, free)
  - Model: all-MiniLM-L6-v2 (multilingual support)
- **LLM**: Groq API (Llama 3 - free tier)

#### Database / 数据库
- **Primary DB**: Neon Postgres (Serverless)
- **Vector Extension**: pgvector
- **Connection**: Neon serverless driver

#### Deployment / 部署
- **Hosting**: Vercel (Free tier)
- **CDN**: Vercel Edge Network
- **Environment**: Node.js 18+

#### Development Tools / 开发工具
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Git Hooks**: Husky (optional for MVP)

---

## 3. Core Components / 核心组件

### 3.1 Knowledge Base Management / 知识库管理

**Responsibilities / 职责:**
- Upload and store documents (PDF, TXT, MD)
- Parse and chunk documents into manageable pieces
- Generate embeddings for each chunk
- Store vectors in Neon with pgvector
- Manage document lifecycle (CRUD operations)

**Key Files / 关键文件:**
```
/app/api/documents/upload/route.ts
/app/api/documents/[id]/route.ts
/lib/document-processor.ts
/lib/embeddings.ts
/lib/chunking.ts
```

### 3.2 Chat Widget / 聊天组件

**Responsibilities / 职责:**
- Embeddable iframe or script tag
- Responsive chat UI
- Message history display
- Typing indicators
- Multi-language support (EN/CN)

**Key Files / 关键文件:**
```
/app/widget/page.tsx
/components/chat-widget.tsx
/components/chat-message.tsx
/public/embed.js (widget loader script)
```

### 3.3 RAG Query Engine / RAG 查询引擎

**Responsibilities / 职责:**
- Accept user questions
- Generate query embeddings
- Perform vector similarity search
- Retrieve top-k relevant chunks
- Assemble context for LLM
- Call Groq API with context
- Return AI-generated response

**Key Files / 关键文件:**
```
/app/api/chat/route.ts
/lib/rag-engine.ts
/lib/vector-search.ts
/lib/llm-client.ts
```

### 3.4 Admin Dashboard / 管理后台

**Responsibilities / 职责:**
- View all uploaded documents
- Upload new documents
- Delete documents
- View conversation history
- Basic analytics (message count, etc.)

**Key Files / 关键文件:**
```
/app/admin/page.tsx
/app/admin/documents/page.tsx
/app/admin/conversations/page.tsx
/components/admin/*
```

---

## 4. Data Flow / 数据流

### 4.1 Document Upload Flow / 文档上传流程

```
User uploads file → Upload API → Vercel Blob Storage
                                        ↓
                                  Parse document
                                        ↓
                                  Chunk into pieces
                                        ↓
                           Generate embeddings (transformers.js)
                                        ↓
                            Store in Neon (pgvector)
                                        ↓
                              Return success response
```

### 4.2 Chat Query Flow / 聊天查询流程

```
User sends question → Chat API → Generate query embedding
                                        ↓
                            Vector search in Neon (pgvector)
                                        ↓
                            Retrieve top 3-5 relevant chunks
                                        ↓
                        Assemble prompt with context + question
                                        ↓
                                Send to Groq API
                                        ↓
                            Stream response back to user
                                        ↓
                            Store conversation in DB
```

---

## 5. API Endpoints / API 端点

### 5.1 Document Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/documents/upload | Upload new document |
| GET | /api/documents | List all documents |
| GET | /api/documents/[id] | Get document details |
| DELETE | /api/documents/[id] | Delete document |

### 5.2 Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat | Send message and get AI response |
| GET | /api/conversations | List all conversations |
| GET | /api/conversations/[id] | Get conversation details |

### 5.3 Widget

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /widget | Render chat widget |
| GET | /embed.js | Widget loader script |

---

## 6. Security Considerations / 安全考虑

### 6.1 MVP Security (No Auth)

Since MVP has no authentication, we implement basic security:

1. **Rate Limiting**:
   - Implement rate limiting per IP (20 requests/min)
   - Use Vercel Edge Config or Upstash Redis (free tier)

2. **CORS Configuration**:
   - Allow specific domains for widget embedding
   - Configure in next.config.js

3. **Input Validation**:
   - Validate file types and sizes
   - Sanitize user input to prevent XSS
   - Limit message length (500 chars)

4. **API Key Protection**:
   - Store Groq API key in environment variables
   - Never expose in client-side code

### 6.2 Future Security Enhancements

- Add admin authentication (NextAuth.js)
- Implement tenant isolation
- Add API key authentication for widget embedding
- Enhanced rate limiting per tenant

---

## 7. Performance Optimization / 性能优化

### 7.1 Caching Strategy

1. **Document Embeddings**: Cache in database (no recomputation)
2. **Static Assets**: Leverage Vercel CDN
3. **API Responses**: Cache similar queries (future enhancement)

### 7.2 Optimization Techniques

1. **Edge Runtime**: Use Edge functions for faster response
2. **Streaming**: Stream LLM responses for better UX
3. **Lazy Loading**: Load widget components on demand
4. **Chunking Strategy**: Optimal chunk size (500-1000 tokens)
5. **Vector Search**: Use pgvector indexing for fast retrieval

---

## 8. Internationalization / 国际化

### 8.1 Language Support

- **Primary Languages**: English, Chinese (Simplified)
- **Implementation**: next-intl or i18next
- **Storage**: JSON locale files

### 8.2 LLM Language Handling

- Llama 3 supports both English and Chinese
- Prompt engineering to maintain response language consistency
- Detect user language and respond accordingly

---

## 9. Monitoring & Logging / 监控和日志

### 9.1 MVP Monitoring (Free Tools)

1. **Vercel Analytics**: Built-in analytics
2. **Console Logging**: Structured logs for debugging
3. **Error Tracking**: Next.js error boundaries

### 9.2 Future Enhancements

- Add Sentry for error tracking
- Implement custom analytics dashboard
- Log query performance metrics

---

## 10. Scalability Considerations / 可扩展性考虑

### 10.1 Current Limitations (Free Tier)

- **Neon**: 0.5 GB storage, 100 hours compute/month
- **Vercel**: 100 GB bandwidth, 100 GB-hours execution
- **Groq**: Rate limits apply (check current limits)
- **Vercel Blob**: 500 MB storage

### 10.2 Scaling Path

1. **Phase 1 (MVP)**: Single tenant, limited documents
2. **Phase 2**: Multi-tenant with paid tiers
3. **Phase 3**: Migrate to dedicated infrastructure if needed

---

## 11. Development Environment / 开发环境

### 11.1 Prerequisites

```bash
Node.js >= 18.x
pnpm >= 8.x
Git
```

### 11.2 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db

# LLM
GROQ_API_KEY=your_groq_api_key

# Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 12. Testing Strategy / 测试策略

### 12.1 MVP Testing

1. **Manual Testing**: Core user flows
2. **Component Testing**: Key React components
3. **API Testing**: Test endpoints with Postman/curl

### 12.2 Future Testing

- Unit tests with Jest
- Integration tests with Playwright
- E2E tests for critical paths

---

## 13. Deployment Checklist / 部署清单

- [ ] Set up Neon database with pgvector
- [ ] Create Vercel project
- [ ] Configure environment variables
- [ ] Deploy to Vercel
- [ ] Test widget embedding
- [ ] Upload initial knowledge base documents
- [ ] Test RAG query flow
- [ ] Verify multi-language support
- [ ] Set up custom domain (if needed)
- [ ] Add widget to polarisaistudio.com

---

## 14. Known Limitations & Future Work / 已知限制和未来工作

### 14.1 MVP Limitations

- No user authentication
- Single tenant only
- Limited analytics
- Basic error handling
- No conversation memory (each query is stateless)

### 14.2 Future Enhancements

- [ ] Multi-turn conversations with context memory
- [ ] Admin authentication
- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard
- [ ] Document update/versioning
- [ ] Feedback mechanism (thumbs up/down)
- [ ] Integration with customer CRM systems
- [ ] WhatsApp/Telegram bot integration
- [ ] Voice input support

---

## 15. References / 参考资料

- [Neon Postgres + pgvector](https://neon.tech/docs/extensions/pgvector)
- [Groq API Documentation](https://console.groq.com/docs)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Transformers.js](https://huggingface.co/docs/transformers.js)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
