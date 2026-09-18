// src/config/env.js
// Validates all required environment variables on application startup.
// If any required variable is missing or invalid, the app will refuse to start.
// This prevents hard-to-debug runtime errors from missing config.

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL URL'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  TZ: z.string().default('Asia/Bangkok'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  RATE_LIMIT_LOGIN_MAX: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_LOGIN_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_CHECKIN_MAX: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_CHECKIN_WINDOW_MS: z.coerce.number().int().positive().default(60000),

  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment variables:');
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
