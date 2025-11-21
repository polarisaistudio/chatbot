# Polaris AI Support - AI Customer Service System
# 智能客服系统

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)

An embeddable AI-powered customer support chatbot widget that uses RAG (Retrieval-Augmented Generation) technology to provide intelligent responses based on your knowledge base.

一个可嵌入的 AI 智能客服聊天机器人，使用 RAG 技术基于您的知识库提供智能回答。

---

## Features / 功能特性

- **Knowledge Base Management** - Upload and manage PDF, TXT, and MD documents
- **RAG-Powered Responses** - Accurate answers based on your documents using vector search
- **Embeddable Widget** - Easy integration into any website with a simple script tag
- **Admin Dashboard** - Manage documents, view conversations, and analytics
- **Multi-language Support** - Native support for English and Chinese
- **Free Tier Deployment** - Runs entirely on free services (Vercel, Neon, Groq)
- **Real-time Streaming** - Fast, streaming responses for better UX

---

## Tech Stack / 技术栈

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**

### Backend
- **Next.js API Routes**
- **Drizzle ORM**
- **Transformers.js** (embeddings)
- **Groq API** (Llama 3)

### Database & Storage
- **Neon Postgres** (with pgvector)
- **Vercel Blob Storage**

### Deployment
- **Vercel** (hosting + edge functions)

---

## Quick Start / 快速开始

### Prerequisites / 前置要求

- Node.js 18+
- pnpm 8+
- A Neon account (free tier)
- A Groq API key (free tier)
- A Vercel account (free tier)

### Installation / 安装

1. **Clone the repository** / 克隆仓库
   ```bash
   git clone https://github.com/yourusername/polaris-ai-support.git
   cd polaris-ai-support
   ```

2. **Install dependencies** / 安装依赖
   ```bash
   pnpm install
   ```

3. **Set up environment variables** / 配置环境变量
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your credentials:
   ```env
   DATABASE_URL=postgresql://user:pass@host/db
   GROQ_API_KEY=your_groq_api_key
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up database** / 设置数据库
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. **Run development server** / 运行开发服务器
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure / 项目结构

```
polaris-ai-support/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API endpoints
│   │   ├── admin/        # Admin dashboard
│   │   └── widget/       # Embeddable chat widget
│   ├── components/       # React components
│   ├── lib/              # Core business logic
│   │   ├── db/           # Database & schema
│   │   ├── rag/          # RAG engine
│   │   ├── embeddings/   # Embedding generation
│   │   ├── parsers/      # Document parsers
│   │   └── llm/          # LLM integration
│   └── types/            # TypeScript types
├── public/               # Static files
├── docs/                 # Documentation
│   ├── DESIGN.md         # Technical design
│   ├── DATABASE_SCHEMA.md # Database schema
│   ├── ROADMAP.md        # Implementation roadmap
│   └── PROJECT_STRUCTURE.md # Detailed structure
└── README.md             # You are here
```

For detailed structure, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

---

## Documentation / 文档

This project includes comprehensive planning and design documents:

- **[DESIGN.md](./DESIGN.md)** - Technical design document with architecture, tech stack, and system design
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete database schema with SQL and Drizzle definitions
- **[ROADMAP.md](./ROADMAP.md)** - Week-by-week implementation plan (4-6 weeks)
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Detailed file and folder structure guide

---

## Usage / 使用方法

### 1. Admin Dashboard / 管理后台

Access the admin dashboard at `/admin` to:
- Upload documents (PDF, TXT, MD)
- View all documents and their processing status
- Browse conversation history
- View basic analytics

### 2. Chat Widget / 聊天组件

The chat widget is available at `/widget` and can be embedded on any website:

```html
<!-- Add this to your website -->
<script src="https://your-domain.vercel.app/embed.js"></script>
```

### 3. API Endpoints / API 端点

#### Upload Document
```bash
POST /api/documents/upload
Content-Type: multipart/form-data

# Response
{
  "id": "uuid",
  "title": "document.pdf",
  "status": "processing"
}
```

#### Chat Query
```bash
POST /api/chat
Content-Type: application/json

{
  "message": "What is your return policy?",
  "sessionId": "session_123"
}

# Response (streaming)
{
  "response": "Based on our policy document...",
  "sources": [...]
}
```

For complete API documentation, see `docs/API.md` (to be created).

---

## Development / 开发

### Available Scripts / 可用脚本

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate migration
pnpm db:push          # Apply migration
pnpm db:studio        # Open Drizzle Studio

# Code Quality
pnpm lint             # Lint code
pnpm type-check       # Type check
pnpm format           # Format with Prettier
```

### Development Workflow / 开发工作流

1. Create feature branch
2. Make changes
3. Test locally
4. Commit with clear message
5. Push and create PR
6. Merge to main (auto-deploys on Vercel)

---

## Deployment / 部署

### Deploy to Vercel / 部署到 Vercel

1. **Connect GitHub repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Import Project"
   - Select your repository

2. **Configure environment variables**
   - Add all variables from `.env.example`
   - Get values from Neon, Groq, etc.

3. **Deploy**
   - Vercel will auto-build and deploy
   - Get your production URL

4. **Set up database**
   ```bash
   # Run migrations in production
   pnpm db:push
   ```

5. **Test**
   - Visit your Vercel URL
   - Upload test documents
   - Test chat queries
   - Embed widget on your site

For detailed deployment guide, see `docs/DEPLOYMENT.md` (to be created).

---

## Roadmap / 路线图

### MVP (Current) / MVP（当前）
- ✅ Document upload and processing
- ✅ RAG-powered Q&A
- ✅ Embeddable chat widget
- ✅ Admin dashboard
- ✅ Multi-language support (EN/CN)

### Phase 2 (Planned) / 第二阶段（计划中）
- [ ] User authentication for admin
- [ ] Multi-turn conversation context
- [ ] Feedback mechanism (thumbs up/down)
- [ ] Advanced analytics
- [ ] Document versioning

### Phase 3 (Future) / 第三阶段（未来）
- [ ] Multi-tenant support
- [ ] Voice input support
- [ ] Integration with CRM systems
- [ ] WhatsApp/Telegram bot
- [ ] Custom widget theming

See [ROADMAP.md](./ROADMAP.md) for detailed timeline.

---

## Configuration / 配置

### Environment Variables / 环境变量

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon Postgres connection string | Yes |
| `GROQ_API_KEY` | Groq API key for LLM | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |

### Customization / 自定义

- **Chunk size**: Edit `lib/chunking/text-splitter.ts`
- **Embedding model**: Edit `lib/embeddings/embedding-generator.ts`
- **LLM model**: Edit `lib/llm/groq-client.ts`
- **Prompt templates**: Edit `lib/prompts/templates.ts`

---

## Performance / 性能

### Benchmarks (Approximate) / 基准测试（约）

- **Document processing**: ~30 seconds for 10-page PDF
- **Query response time**: 2-4 seconds (including LLM)
- **Vector search**: <100ms for 10,000 chunks
- **Concurrent users**: 50+ (Vercel free tier)

### Optimization Tips / 优化建议

- Use Edge Runtime for faster responses
- Implement caching for frequent queries
- Optimize chunk size for your use case
- Monitor and adjust pgvector index

---

## Troubleshooting / 故障排除

### Common Issues / 常见问题

**Issue: Database connection fails**
- Check `DATABASE_URL` is correct
- Verify Neon database is running
- Ensure pgvector extension is enabled

**Issue: Embedding generation is slow**
- First run downloads model (~100MB)
- Subsequent runs use cached model
- Consider batch processing for large docs

**Issue: Widget not loading**
- Check CORS configuration in `next.config.js`
- Verify `NEXT_PUBLIC_APP_URL` is correct
- Check browser console for errors

**Issue: Poor answer quality**
- Upload more relevant documents
- Adjust chunk size and overlap
- Improve prompt templates
- Increase retrieved chunks (k parameter)

---

## Contributing / 贡献

Contributions are welcome! Please:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Please read our contributing guidelines (to be created) before submitting PRs.

---

## License / 许可证

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support / 支持

- **Documentation**: See `docs/` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/polaris-ai-support/issues)
- **Email**: support@polarisaistudio.com (replace with actual)

---

## Acknowledgments / 致谢

Built with:
- [Next.js](https://nextjs.org/)
- [Neon](https://neon.tech/)
- [Groq](https://groq.com/)
- [Vercel](https://vercel.com/)
- [Transformers.js](https://huggingface.co/docs/transformers.js)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)

---

## Project Status / 项目状态

**Current Phase**: Phase 3 Complete - Production Ready ✅

- ✅ Phase 1: Foundation Setup (Database, API, Core Libraries)
- ✅ Phase 2: RAG Engine (Document Processing, Vector Search, LLM Integration)
- ✅ Phase 3: Frontend UI (Admin Dashboard, Chat Widget, Embeddable Script)
- 🚀 Phase 4: Ready for Vercel Deployment

### Completed Features
- ✅ Document upload and processing (PDF, TXT, MD)
- ✅ Vector embeddings with Transformers.js (384d)
- ✅ Semantic search with pgvector
- ✅ RAG-powered responses with Groq/Llama 3.3
- ✅ Multi-language support (English & Chinese)
- ✅ Admin dashboard with document management
- ✅ Conversation history viewer
- ✅ Standalone chat widget
- ✅ Embeddable JavaScript widget (zero dependencies)
- ✅ Demo page with integration examples
- ✅ End-to-end test suite

See [ROADMAP.md](./ROADMAP.md) for full implementation timeline.

---

**Made with ❤️ by Polaris AI Studio**

**Built for the future of customer support / 为客服的未来而构建**
