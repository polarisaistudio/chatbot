import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">
          Polaris AI Support
        </h1>
        <p className="text-xl text-muted-foreground">
          Intelligent Customer Service System powered by RAG Technology
        </p>
        <p className="text-lg text-muted-foreground">
          智能客服系统 - 基于 RAG 技术
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/admin"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/widget"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition"
          >
            View Chat Widget
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">📚 Knowledge Base Management</h3>
              <p className="text-sm text-muted-foreground">
                Upload and manage PDF, TXT, and MD documents
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">🤖 RAG-Powered Q&A</h3>
              <p className="text-sm text-muted-foreground">
                Accurate answers based on your documents using vector search
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">💬 Embeddable Widget</h3>
              <p className="text-sm text-muted-foreground">
                Easy integration into any website with a simple script tag
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">🌍 Multi-language Support</h3>
              <p className="text-sm text-muted-foreground">
                Native support for English and Chinese
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>Built with Next.js 14, Neon Postgres, and Groq AI</p>
        </div>
      </div>
    </main>
  );
}
