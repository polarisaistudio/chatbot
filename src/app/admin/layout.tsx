/**
 * Admin Dashboard Layout
 */

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Don't wrap login page with auth layout
  // Auth protection is handled by middleware
  return <>{children}</>;
}
