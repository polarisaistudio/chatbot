# Polaris AI Support - Implementation Roadmap
# 实施路线图

**Version**: 1.0
**Last Updated**: 2025-11-20
**Estimated Timeline**: 4-6 weeks for MVP

---

## 1. Project Phases Overview / 项目阶段概览

```
Phase 1: Foundation Setup (Week 1)
   └─> Phase 2: Core Backend (Week 2-3)
         └─> Phase 3: Frontend & Widget (Week 3-4)
               └─> Phase 4: Integration & Testing (Week 5)
                     └─> Phase 5: Deployment & Polish (Week 6)
```

---

## 2. Phase 1: Foundation Setup (Week 1) / 第一阶段：基础设置

**Goal / 目标**: Set up development environment and core infrastructure

### 2.1 Day 1-2: Project Initialization

- [ ] Initialize Next.js 14 project with TypeScript
  ```bash
  pnpm create next-app@latest polaris-ai-support --typescript --tailwind --app --src-dir
  ```
- [ ] Install core dependencies
  ```bash
  pnpm add drizzle-orm @neondatabase/serverless
  pnpm add -D drizzle-kit
  pnpm add @xenova/transformers
  pnpm add groq-sdk
  pnpm add @vercel/blob
  pnpm add zod
  pnpm add lucide-react
  ```
- [ ] Set up project structure (see PROJECT_STRUCTURE.md)
- [ ] Configure ESLint and Prettier
- [ ] Initialize Git repository
- [ ] Create .env.example file

**Deliverables / 交付物**:
- ✅ Next.js project initialized
- ✅ Dependencies installed
- ✅ Basic folder structure created
- ✅ Git repository initialized

---

### 2.2 Day 3-4: Database Setup

- [ ] Create Neon Postgres database
  - Sign up at neon.tech
  - Create new project
  - Enable pgvector extension
  - Get connection string
- [ ] Configure Drizzle ORM
  - Create `drizzle.config.ts`
  - Create schema file `lib/db/schema.ts`
  - Set up database connection `lib/db/index.ts`
- [ ] Create and run initial migration
  ```bash
  pnpm drizzle-kit generate:pg
  pnpm drizzle-kit push:pg
  ```
- [ ] Test database connection
- [ ] Create seed data script (optional)

**Deliverables / 交付物**:
- ✅ Neon database created and configured
- ✅ Drizzle ORM setup complete
- ✅ Database schema migrated
- ✅ Connection tested

---

### 2.3 Day 5: External Services Setup

- [ ] Set up Vercel project
  - Connect GitHub repository
  - Configure environment variables
  - Set up Blob storage
- [ ] Get Groq API key
  - Sign up at console.groq.com
  - Generate API key
  - Test API connection
- [ ] Configure environment variables
  ```env
  DATABASE_URL=
  GROQ_API_KEY=
  BLOB_READ_WRITE_TOKEN=
  NEXT_PUBLIC_APP_URL=
  ```
- [ ] Create utility for environment validation

**Deliverables / 交付物**:
- ✅ Vercel project configured
- ✅ Groq API key obtained
- ✅ Blob storage configured
- ✅ Environment variables set

---

## 3. Phase 2: Core Backend Development (Week 2-3) / 第二阶段：核心后端开发

**Goal / 目标**: Implement RAG engine and document processing

### 3.1 Week 2, Day 1-2: Document Processing

- [ ] Implement file upload handler
  - File: `app/api/documents/upload/route.ts`
  - Validate file type and size
  - Upload to Vercel Blob
  - Create database entry
- [ ] Implement document parsers
  - File: `lib/parsers/pdf-parser.ts` (use pdf-parse)
  - File: `lib/parsers/text-parser.ts` (native fs)
  - File: `lib/parsers/markdown-parser.ts`
- [ ] Implement text chunking
  - File: `lib/chunking/text-splitter.ts`
  - Algorithm: Recursive character text splitter
  - Chunk size: 500-1000 tokens with overlap
  - Preserve sentence boundaries
- [ ] Test with sample documents

**Deliverables / 交付物**:
- ✅ File upload API endpoint
- ✅ Document parsers for PDF/TXT/MD
- ✅ Text chunking implementation
- ✅ Manual testing completed

**Example Code / 示例代码**:
```typescript
// lib/chunking/text-splitter.ts
export class RecursiveTextSplitter {
  constructor(
    private chunkSize: number = 1000,
    private chunkOverlap: number = 200
  ) {}

  splitText(text: string): string[] {
    // Implementation
  }
}
```

---

### 3.2 Week 2, Day 3-4: Embedding Generation

- [ ] Set up Transformers.js
  - File: `lib/embeddings/embedding-generator.ts`
  - Load model: all-MiniLM-L6-v2
  - Implement caching for model
- [ ] Create embedding pipeline
  - Batch processing for efficiency
  - Error handling
  - Progress tracking
- [ ] Implement vector storage
  - File: `lib/db/vector-operations.ts`
  - Insert embeddings into pgvector
  - Batch insert for performance
- [ ] Test embedding generation
  - Verify vector dimensions (384)
  - Test with Chinese and English text

**Deliverables / 交付物**:
- ✅ Embedding generation implemented
- ✅ Vector storage in pgvector working
- ✅ Batch processing optimized
- ✅ Multi-language support verified

**Example Code / 示例代码**:
```typescript
// lib/embeddings/embedding-generator.ts
import { pipeline } from '@xenova/transformers';

export class EmbeddingGenerator {
  private static instance: EmbeddingGenerator;
  private pipe: any;

  async initialize() {
    this.pipe = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const output = await this.pipe(text, {
      pooling: 'mean',
      normalize: true,
    });
    return Array.from(output.data);
  }
}
```

---

### 3.3 Week 2, Day 5 - Week 3, Day 1: Document Processing Pipeline

- [ ] Create end-to-end processing pipeline
  - File: `lib/processing/document-processor.ts`
  - Orchestrate: upload → parse → chunk → embed → store
  - Update document status in database
  - Handle errors gracefully
- [ ] Implement background job system (simple)
  - Option 1: Use Vercel serverless functions
  - Option 2: Simple queue with database
- [ ] Add progress tracking
  - Update total_chunks count
  - Store error messages
- [ ] Test complete pipeline

**Deliverables / 交付物**:
- ✅ Complete document processing pipeline
- ✅ Error handling implemented
- ✅ Status tracking working
- ✅ End-to-end test passed

---

### 3.4 Week 3, Day 2-3: RAG Query Engine

- [ ] Implement vector search
  - File: `lib/rag/vector-search.ts`
  - Query embedding generation
  - Cosine similarity search with pgvector
  - Return top-k chunks (k=3-5)
- [ ] Implement context assembly
  - File: `lib/rag/context-builder.ts`
  - Combine retrieved chunks
  - Format for LLM prompt
  - Add metadata (source document, etc.)
- [ ] Create prompt templates
  - File: `lib/prompts/templates.ts`
  - System prompt for customer support
  - User query template
  - Support Chinese and English

**Deliverables / 交付物**:
- ✅ Vector search implemented
- ✅ Context assembly working
- ✅ Prompt templates created
- ✅ Multi-language support

**Example Code / 示例代码**:
```typescript
// lib/prompts/templates.ts
export const SYSTEM_PROMPT = `You are a helpful customer support assistant.
Use the following context to answer the user's question.
If you don't know the answer, say so politely.

Context:
{context}

Question: {question}

Answer:`;
```

---

### 3.5 Week 3, Day 4-5: LLM Integration

- [ ] Implement Groq API client
  - File: `lib/llm/groq-client.ts`
  - Configure Llama 3 model
  - Implement streaming support
  - Add retry logic
- [ ] Create chat API endpoint
  - File: `app/api/chat/route.ts`
  - Accept user query
  - Execute RAG pipeline
  - Stream response back
  - Store conversation in database
- [ ] Add conversation management
  - Create/retrieve conversation
  - Store messages
  - Update analytics
- [ ] Test RAG query flow end-to-end

**Deliverables / 交付物**:
- ✅ Groq client implemented
- ✅ Chat API endpoint working
- ✅ Streaming responses functional
- ✅ Conversation storage working
- ✅ End-to-end RAG test passed

**Example Code / 示例代码**:
```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { message, sessionId } = await req.json();

  // 1. Generate query embedding
  // 2. Vector search
  // 3. Assemble context
  // 4. Call Groq API
  // 5. Stream response
  // 6. Store in database

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

---

## 4. Phase 3: Frontend & Widget Development (Week 3-4) / 第三阶段：前端开发

**Goal / 目标**: Build admin dashboard and embeddable widget

### 4.1 Week 3 (remaining) - Week 4, Day 1-2: Admin Dashboard

- [ ] Set up UI component library
  - Install shadcn/ui components
  - Configure theme
  - Create base layout
- [ ] Create admin layout
  - File: `app/admin/layout.tsx`
  - Navigation sidebar
  - Header with title
- [ ] Build Documents page
  - File: `app/admin/documents/page.tsx`
  - List all documents
  - Upload new document
  - Delete document
  - Show processing status
- [ ] Build document upload component
  - File: `components/admin/document-upload.tsx`
  - Drag & drop support
  - File validation
  - Upload progress
- [ ] Create API routes for admin
  - GET /api/documents
  - DELETE /api/documents/[id]

**Deliverables / 交付物**:
- ✅ Admin layout created
- ✅ Documents page functional
- ✅ Document upload working
- ✅ File management complete

---

### 4.2 Week 4, Day 3-4: Conversations Dashboard

- [ ] Build Conversations page
  - File: `app/admin/conversations/page.tsx`
  - List all conversations
  - View conversation details
  - Display message history
- [ ] Create conversation detail view
  - File: `app/admin/conversations/[id]/page.tsx`
  - Show all messages
  - Display metadata
  - Show retrieved chunks
- [ ] Build Analytics dashboard (simple)
  - File: `app/admin/analytics/page.tsx`
  - Total conversations
  - Total messages
  - Average response time
  - Success rate
- [ ] Create API routes
  - GET /api/conversations
  - GET /api/conversations/[id]
  - GET /api/analytics

**Deliverables / 交付物**:
- ✅ Conversations page complete
- ✅ Conversation detail view working
- ✅ Basic analytics dashboard
- ✅ Admin dashboard MVP complete

---

### 4.3 Week 4, Day 5 - Week 5, Day 1: Chat Widget

- [ ] Create widget page
  - File: `app/widget/page.tsx`
  - Minimal layout (no header/footer)
  - Chat interface
  - Message list
  - Input area
- [ ] Build chat components
  - File: `components/widget/chat-container.tsx`
  - File: `components/widget/message-list.tsx`
  - File: `components/widget/message-bubble.tsx`
  - File: `components/widget/chat-input.tsx`
- [ ] Implement chat logic
  - Send messages to API
  - Receive streaming responses
  - Display typing indicator
  - Handle errors
- [ ] Add internationalization
  - Detect user language
  - Support EN/CN
  - Use next-intl or simple i18n
- [ ] Style for responsiveness
  - Mobile-first design
  - Smooth animations
  - Polished UI

**Deliverables / 交付物**:
- ✅ Chat widget UI complete
- ✅ Message streaming working
- ✅ Multi-language support
- ✅ Responsive design

**Example Component / 示例组件**:
```typescript
// components/widget/chat-container.tsx
'use client';

export function ChatContainer() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    // Implementation
  };

  return (
    <div className="flex flex-col h-screen">
      <MessageList messages={messages} />
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
```

---

### 4.4 Week 5, Day 2: Widget Embedding

- [ ] Create widget loader script
  - File: `public/embed.js`
  - Inject iframe into customer website
  - Handle positioning (bottom-right)
  - Toggle visibility
  - Responsive behavior
- [ ] Create widget configuration
  - Customizable colors (future)
  - Position settings
  - Language preference
- [ ] Test embedding on sample HTML page
  - Create test page: `public/test-embed.html`
  - Test iframe injection
  - Test communication
- [ ] Add CORS configuration
  - Configure in `next.config.js`
  - Allow specific domains

**Deliverables / 交付物**:
- ✅ Widget loader script created
- ✅ Embedding tested
- ✅ CORS configured
- ✅ Widget embeddable

**Example Embed Script / 示例嵌入脚本**:
```javascript
// public/embed.js
(function() {
  const script = document.currentScript;
  const container = document.createElement('div');
  container.id = 'polaris-chat-widget';

  const iframe = document.createElement('iframe');
  iframe.src = 'https://your-domain.com/widget';
  iframe.style.cssText = 'position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;';

  container.appendChild(iframe);
  document.body.appendChild(container);
})();
```

---

## 5. Phase 4: Integration & Testing (Week 5) / 第四阶段：集成测试

**Goal / 目标**: Comprehensive testing and bug fixes

### 5.1 Day 3: End-to-End Testing

- [ ] Test complete document flow
  - Upload PDF document
  - Verify processing status
  - Check chunks in database
  - Query document content
- [ ] Test complete chat flow
  - Start new conversation
  - Send multiple messages
  - Verify responses
  - Check conversation storage
- [ ] Test error scenarios
  - Invalid file upload
  - Failed processing
  - Network errors
  - Rate limiting
- [ ] Performance testing
  - Measure response times
  - Test with multiple documents
  - Load testing (simple)

**Deliverables / 交付物**:
- ✅ All flows tested
- ✅ Bugs documented
- ✅ Critical bugs fixed
- ✅ Performance baseline established

---

### 5.2 Day 4: Bug Fixes & Polish

- [ ] Fix identified bugs
- [ ] Improve error messages
- [ ] Add loading states
- [ ] Improve UI/UX
  - Better animations
  - Clearer feedback
  - Polished design
- [ ] Add input validation
  - Client-side validation
  - Server-side validation
- [ ] Optimize performance
  - Code splitting
  - Image optimization
  - API optimization

**Deliverables / 交付物**:
- ✅ Major bugs fixed
- ✅ UI polished
- ✅ Validation added
- ✅ Performance improved

---

### 5.3 Day 5: Multi-language Testing

- [ ] Test with Chinese documents
  - Upload Chinese PDF
  - Verify chunking
  - Test queries in Chinese
- [ ] Test with English documents
- [ ] Test mixed language scenarios
- [ ] Verify language detection
- [ ] Test widget in both languages

**Deliverables / 交付物**:
- ✅ Chinese support verified
- ✅ English support verified
- ✅ Language switching works
- ✅ Multi-language ready

---

## 6. Phase 5: Deployment & Launch (Week 6) / 第五阶段：部署上线

**Goal / 目标**: Deploy to production and launch demo

### 6.1 Day 1-2: Production Deployment

- [ ] Configure production environment
  - Set production environment variables
  - Configure domain (if custom)
  - Set up SSL/TLS
- [ ] Deploy to Vercel
  ```bash
  git push origin main
  # Vercel auto-deploys
  ```
- [ ] Verify deployment
  - Test all endpoints
  - Check database connection
  - Verify blob storage
  - Test widget embedding
- [ ] Set up monitoring
  - Vercel Analytics
  - Error logging
  - Performance monitoring

**Deliverables / 交付物**:
- ✅ Production deployed
- ✅ All services verified
- ✅ Monitoring enabled
- ✅ Production checklist complete

---

### 6.2 Day 3: Content Preparation

- [ ] Prepare initial knowledge base
  - Company information
  - Product documentation
  - FAQ documents
  - Support guides
- [ ] Upload documents to production
  - Test processing
  - Verify embeddings
  - Test queries
- [ ] Create test scenarios
  - Common questions
  - Edge cases
  - Multi-language queries

**Deliverables / 交付物**:
- ✅ Knowledge base prepared
- ✅ Documents uploaded
- ✅ Content verified
- ✅ Test scenarios documented

---

### 6.3 Day 4: Integration with polarisaistudio.com

- [ ] Prepare embedding code
  ```html
  <script src="https://your-domain.vercel.app/embed.js"></script>
  ```
- [ ] Test on staging environment
- [ ] Deploy to polarisaistudio.com
- [ ] Verify widget functionality
- [ ] Test on different devices
  - Desktop
  - Tablet
  - Mobile
- [ ] Test on different browsers
  - Chrome
  - Firefox
  - Safari
  - Edge

**Deliverables / 交付物**:
- ✅ Widget embedded on website
- ✅ Cross-device testing complete
- ✅ Cross-browser testing complete
- ✅ Integration successful

---

### 6.4 Day 5: Documentation & Handoff

- [ ] Create user documentation
  - How to use admin dashboard
  - How to upload documents
  - How to embed widget
  - Troubleshooting guide
- [ ] Create technical documentation
  - API documentation
  - Database schema reference
  - Deployment guide
  - Maintenance guide
- [ ] Create README.md
  - Project overview
  - Setup instructions
  - Environment variables
  - Development guide
- [ ] Final review
  - Code review
  - Documentation review
  - Security review

**Deliverables / 交付物**:
- ✅ User docs complete
- ✅ Technical docs complete
- ✅ README created
- ✅ Project ready for handoff

---

## 7. Post-Launch Tasks / 上线后任务

### 7.1 Week 6+: Monitoring & Iteration

- [ ] Monitor production metrics
  - Response times
  - Error rates
  - User engagement
- [ ] Gather user feedback
- [ ] Create improvement backlog
- [ ] Plan next iteration

### 7.2 Future Enhancements (Post-MVP)

Priority 1 (High Impact):
- [ ] Add conversation context memory
- [ ] Implement feedback mechanism (thumbs up/down)
- [ ] Add admin authentication
- [ ] Improve analytics dashboard

Priority 2 (Medium Impact):
- [ ] Multi-tenant support
- [ ] Document versioning
- [ ] Advanced search filters
- [ ] Custom widget theming

Priority 3 (Low Impact / Nice to Have):
- [ ] Voice input support
- [ ] Export conversations
- [ ] Integration with CRM
- [ ] WhatsApp/Telegram bot

---

## 8. Risk Management / 风险管理

### 8.1 Identified Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Groq API rate limits | High | Medium | Implement rate limiting, fallback to queue |
| Neon storage limits | Medium | Low | Monitor usage, implement cleanup |
| Embedding quality for Chinese | High | Medium | Test extensively, consider alternative models |
| Widget compatibility issues | Medium | Medium | Cross-browser testing, fallback UI |
| Processing large PDFs | Medium | Medium | Implement file size limits, chunked processing |

### 8.2 Contingency Plans

- **Groq API issues**: Have backup LLM provider ready (OpenRouter, etc.)
- **Neon limits**: Plan migration to paid tier if needed
- **Performance issues**: Implement caching, optimize queries
- **Security concerns**: Regular security audits, input sanitization

---

## 9. Success Metrics / 成功指标

### 9.1 MVP Success Criteria

- [ ] Document upload success rate > 95%
- [ ] Average query response time < 3 seconds
- [ ] RAG answer relevance > 80% (manual review)
- [ ] Widget embeddable on 3+ different websites
- [ ] Support both EN and CN queries
- [ ] Zero critical bugs in production

### 9.2 Post-Launch Metrics

- Total conversations created
- Average messages per conversation
- User satisfaction (future feedback feature)
- Document coverage (% queries with relevant chunks)
- System uptime > 99%

---

## 10. Timeline Summary / 时间表总结

| Week | Phase | Key Deliverables |
|------|-------|------------------|
| Week 1 | Foundation | Project setup, database, external services |
| Week 2 | Backend (Part 1) | Document processing, embeddings |
| Week 3 | Backend (Part 2) | RAG engine, LLM integration, Admin UI start |
| Week 4 | Frontend | Admin dashboard, Chat widget |
| Week 5 | Testing | Integration tests, bug fixes, multi-language |
| Week 6 | Deployment | Production deploy, content prep, launch |

**Total Estimated Time**: 4-6 weeks (1 developer)

---

## 11. Daily Checklist Template / 每日检查清单模板

### Daily Standup Questions

1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers or issues?
4. Any risks identified?

### End of Day Review

- [ ] Code committed and pushed
- [ ] Documentation updated
- [ ] Tests written/updated
- [ ] Roadmap progress updated
- [ ] Blockers documented

---

## 12. Getting Started Checklist / 开始清单

Ready to start development? Complete this checklist:

- [ ] Read DESIGN.md
- [ ] Read DATABASE_SCHEMA.md
- [ ] Read this ROADMAP.md
- [ ] Review PROJECT_STRUCTURE.md
- [ ] Set up development environment
- [ ] Create Neon database
- [ ] Get Groq API key
- [ ] Initialize Next.js project
- [ ] Start Phase 1, Day 1 tasks

**Let's build! / 开始构建！** 🚀
