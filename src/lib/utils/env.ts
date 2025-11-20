/**
 * Environment variable validation and access
 */

export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || fallback!;
}

export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'GROQ_API_KEY',
    'BLOB_READ_WRITE_TOKEN',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Validated environment variables
export const env = {
  DATABASE_URL: () => getEnvVar('DATABASE_URL'),
  GROQ_API_KEY: () => getEnvVar('GROQ_API_KEY'),
  BLOB_READ_WRITE_TOKEN: () => getEnvVar('BLOB_READ_WRITE_TOKEN'),
  NEXT_PUBLIC_APP_URL: () => getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  NODE_ENV: () => getEnvVar('NODE_ENV', 'development'),
  IS_PRODUCTION: () => getEnvVar('NODE_ENV') === 'production',
  IS_DEVELOPMENT: () => getEnvVar('NODE_ENV', 'development') === 'development',
};
