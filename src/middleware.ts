/**
 * Middleware for route protection
 * Protects /admin routes (except /admin/login) with authentication
 */

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authMiddleware = NextAuth(authConfig).auth;

export default async function middleware(request: NextRequest) {
  // Explicitly allow /admin/login without auth
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Apply auth middleware to all other /admin routes
  return authMiddleware(request as any);
}

export const config = {
  // Match all /admin routes
  matcher: ['/admin/:path*'],
};
