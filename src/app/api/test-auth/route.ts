/**
 * Test API endpoint to diagnose auth issues
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      sessionExists: !!session,
      user: session?.user || null,
      env: {
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
