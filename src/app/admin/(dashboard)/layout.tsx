/**
 * Admin Dashboard Layout
 */

import Link from 'next/link';
import { FileText, MessageSquare, BarChart3 } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Polaris AI</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/admin" icon={<BarChart3 className="w-5 h-5" />}>
            Dashboard
          </NavLink>
          <NavLink href="/admin/documents" icon={<FileText className="w-5 h-5" />}>
            Documents
          </NavLink>
          <NavLink href="/admin/conversations" icon={<MessageSquare className="w-5 h-5" />}>
            Conversations
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">Version 0.1.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}
