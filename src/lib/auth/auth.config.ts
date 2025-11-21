/**
 * NextAuth.js v5 Configuration
 * Auth configuration for admin authentication
 */

import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnLoginPage = nextUrl.pathname === '/admin/login';

      if (isOnAdmin && !isOnLoginPage) {
        if (!isLoggedIn) return false;
        return true;
      }

      if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL('/admin', nextUrl));
      }

      return true;
    },
  },
  providers: [], // Add providers in auth.ts
} satisfies NextAuthConfig;
