/**
 * NextAuth.js v5 Setup
 * Main authentication configuration with credentials provider
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Login schema validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  debug: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] Authorize called with credentials:', { email: credentials?.email });

        // Validate input
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          console.log('[AUTH] Validation failed:', validatedFields.error);
          return null;
        }

        const { email, password } = validatedFields.data;
        console.log('[AUTH] Looking up user:', email);

        // Find user in database
        const [user] = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.email, email))
          .limit(1);

        if (!user) {
          console.log('[AUTH] User not found:', email);
          return null;
        }

        console.log('[AUTH] User found:', { id: user.id, email: user.email, isActive: user.isActive });

        // Check if user is active
        if (!user.isActive) {
          console.log('[AUTH] User is not active');
          return null;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        console.log('[AUTH] Password valid:', isPasswordValid);

        if (!isPasswordValid) {
          return null;
        }

        console.log('[AUTH] Authentication successful, returning user');
        // Return user object (without password)
        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
