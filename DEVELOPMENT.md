# Development Guide

This document provides instructions for developing the Polaris AI Support system.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL` - Neon Postgres connection string (get from https://neon.tech)
- `GROQ_API_KEY` - Groq API key (get from https://console.groq.com)
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token
- `NEXT_PUBLIC_APP_URL` - Your app URL (http://localhost:3000 for development)

### 3. Set Up Database

Once you have your Neon database connection string:

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Drizzle Studio to view database
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed structure.

Key directories:
- `src/app` - Next.js App Router (pages and API routes)
- `src/components` - React components
- `src/lib` - Core business logic
- `src/types` - TypeScript type definitions

## Development Workflow

### Creating a New Feature

1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement changes following the project structure
3. Test locally
4. Commit with clear message
5. Push and create PR

### Adding an API Endpoint

1. Create route file in `src/app/api/your-endpoint/route.ts`
2. Define types in `src/types/api.ts`
3. Implement handler
4. Test with curl or Postman

### Adding a Component

1. Create component in appropriate `src/components` subdirectory
2. Define prop types
3. Use Tailwind for styling
4. Import and use in parent

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
npm run type-check   # Type check with TypeScript
npm run format       # Format code with Prettier
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## Current Implementation Status

✅ **Phase 1: Foundation Setup (Completed)**
- Next.js 14 project initialized
- Dependencies installed
- Project structure created
- Database schema defined
- Utility functions and types created

🔄 **Phase 2: Core Backend (Next)**
- Document processing pipeline
- Embedding generation
- RAG query engine
- LLM integration

See [ROADMAP.md](./ROADMAP.md) for full implementation plan.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: Neon Postgres with pgvector
- **LLM**: Groq API (Llama 3)
- **Embeddings**: Transformers.js
- **Storage**: Vercel Blob

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct in `.env.local`
- Ensure Neon database is running
- Check pgvector extension is enabled

### Module Not Found Errors
- Run `npm install` to ensure all dependencies are installed
- Check import paths use `@/` alias correctly

### Build Errors
- Run `npm run type-check` to identify type errors
- Run `npm run lint` to identify linting issues

## Next Steps

1. Set up external services (Neon, Groq, Vercel)
2. Start implementing Phase 2: Core Backend
3. Follow the [ROADMAP.md](./ROADMAP.md) week by week

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Neon Documentation](https://neon.tech/docs)
- [Groq Documentation](https://console.groq.com/docs)
- [Transformers.js Documentation](https://huggingface.co/docs/transformers.js)
