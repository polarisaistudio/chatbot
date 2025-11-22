/**
 * NextAuth.js v5 Configuration
 * Auth configuration for admin authentication
 */

import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  providers: [], // Add providers in auth.ts
} satisfies NextAuthConfig;
