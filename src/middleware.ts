/**
 * Middleware for route protection
 * Protects /admin routes (except /admin/login) with authentication
 */

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Matcher to protect admin routes
  matcher: ['/admin/:path*'],
};
