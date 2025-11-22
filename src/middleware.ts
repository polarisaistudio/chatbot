/**
 * Middleware for route protection
 * Protects /admin routes (except /admin/login) with authentication
 */

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Protect all admin routes except login
  matcher: ['/admin/((?!login).*)'],
};
