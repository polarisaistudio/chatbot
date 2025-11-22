/**
 * Diagnostic Page - Check Environment and Middleware Status
 */

export const dynamic = 'force-dynamic';

export default async function DiagnosticPage() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    HAS_AUTH_SECRET: !!process.env.AUTH_SECRET,
    HAS_NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    HAS_NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Diagnostic Information</h1>
      <h2>Environment Variables</h2>
      <pre>{JSON.stringify(envVars, null, 2)}</pre>

      <h2>Build Info</h2>
      <p>Timestamp: {new Date().toISOString()}</p>
      <p>Next.js Version: {process.env.npm_package_dependencies_next || 'unknown'}</p>

      <h2>Test</h2>
      <p>If you can see this page, the app is rendering correctly.</p>
      <p>No redirects occurred.</p>
    </div>
  );
}
