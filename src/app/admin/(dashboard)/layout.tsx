/**
 * Admin Dashboard Layout (Protected Pages)
 */

import Link from 'next/link';
import { FileText, MessageSquare, BarChart3, LogOut } from 'lucide-react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

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
          <div className="mb-3 text-xs text-gray-600">
            <p className="font-medium">{session.user?.name}</p>
            <p className="text-gray-500">{session.user?.email}</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-3">Version 0.1.0</p>
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
