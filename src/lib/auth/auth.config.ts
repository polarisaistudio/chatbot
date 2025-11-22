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

      // Allow access to login page
      if (isOnLoginPage) {
        // If already logged in, redirect to dashboard (but don't create loop)
        if (isLoggedIn) {
          return Response.redirect(new URL('/admin', nextUrl));
        }
        return true;
      }

      // For all other /admin routes, require authentication
      if (isOnAdmin) {
        return isLoggedIn;
      }

      // Allow all other routes
      return true;
    },
  },
  providers: [], // Add providers in auth.ts
} satisfies NextAuthConfig;
