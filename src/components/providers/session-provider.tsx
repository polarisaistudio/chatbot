/**
 * Session Provider Wrapper
 * Client component to wrap the app with NextAuth SessionProvider
 */

'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
