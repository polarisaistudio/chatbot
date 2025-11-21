/**
 * Admin Dashboard - Home Page
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, Database, TrendingUp } from 'lucide-react';
import { db } from '@/lib/db';
import { documents, conversations, messages } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [docStats] = await db
    .select({ count: sql<number>`count(*)` })
    .from(documents);

  const [convStats] = await db
    .select({ count: sql<number>`count(*)` })
    .from(conversations);

  const [msgStats] = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages);

  const [completedDocs] = await db
    .select({ count: sql<number>`count(*)` })
    .from(documents)
    .where(sql`status = 'completed'`);

  return {
    totalDocuments: Number(docStats.count),
    totalConversations: Number(convStats.count),
    totalMessages: Number(msgStats.count),
    completedDocuments: Number(completedDocs.count),
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome to your Polaris AI Support admin dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Documents"
          value={stats.totalDocuments}
          description={`${stats.completedDocuments} processed`}
          icon={<FileText className="w-6 h-6 text-blue-600" />}
        />
        <StatsCard
          title="Conversations"
          value={stats.totalConversations}
          description="Total chat sessions"
          icon={<MessageSquare className="w-6 h-6 text-green-600" />}
        />
        <StatsCard
          title="Messages"
          value={stats.totalMessages}
          description="Total messages exchanged"
          icon={<Database className="w-6 h-6 text-purple-600" />}
        />
        <StatsCard
          title="Avg Messages/Conv"
          value={
            stats.totalConversations > 0
              ? Math.round(stats.totalMessages / stats.totalConversations)
              : 0
          }
          description="Per conversation"
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Get started with Polaris AI Support</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-semibold">1</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Upload Documents</h3>
              <p className="text-sm text-gray-500 mt-1">
                Go to Documents page and upload your knowledge base files (PDF, TXT, or
                MD)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-semibold">2</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Embed Widget</h3>
              <p className="text-sm text-gray-500 mt-1">
                Add the chat widget to your website to start helping customers
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-semibold">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Monitor Conversations</h3>
              <p className="text-sm text-gray-500 mt-1">
                Track customer inquiries and improve your knowledge base
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
