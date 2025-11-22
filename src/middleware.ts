/**
 * Middleware for route protection
 * Protects /admin routes (except /admin/login) with authentication
 */

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Only match /admin routes, but exclude /admin/login via regex
  // This matches /admin and /admin/* but NOT /admin/login
  matcher: [
    '/admin',
    '/admin/((?!login).*)',
  ],
};
