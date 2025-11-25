/**
 * Zod validation schemas for API requests
 */

import { z } from 'zod';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, MAX_MESSAGE_LENGTH } from '@/lib/constants';

/**
 * Chat request schema
 */
export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(MAX_MESSAGE_LENGTH, `Message must be less than ${MAX_MESSAGE_LENGTH} characters`),
  sessionId: z.string().nullable().optional(),
  topK: z.number().min(1).max(10).optional().default(5),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * Document upload schema
 */
export const documentUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  fileType: z.enum(ALLOWED_FILE_TYPES, {
    errorMap: () => ({ message: `File type must be one of: ${ALLOWED_FILE_TYPES.join(', ')}` }),
  }),
  fileSize: z
    .number()
    .min(1, 'File size must be greater than 0')
    .max(MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE} bytes`),
});

export type DocumentUpload = z.infer<typeof documentUploadSchema>;

/**
 * Query parameters for listing documents
 */
export const listDocumentsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
  status: z.enum(['processing', 'completed', 'failed', 'all']).nullable().transform(v => v ?? 'all').optional().default('all'),
});

export type ListDocumentsQuery = z.infer<typeof listDocumentsSchema>;

/**
 * Query parameters for listing conversations
 */
export const listConversationsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

export type ListConversationsQuery = z.infer<typeof listConversationsSchema>;
