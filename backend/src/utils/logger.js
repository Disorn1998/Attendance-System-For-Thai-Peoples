// src/utils/logger.js
// Structured JSON logger using pino.
// In development, pino-pretty formats output for human readability.
// In production, raw JSON is output for log aggregators (ELK, Grafana Loki, etc.)
// IMPORTANT: Never log sensitive data (passwords, tokens, PII).

import pino from 'pino';
import { env } from '../config/env.js';

const isDevelopment = env.NODE_ENV === 'development';

export const logger = pino({
  level: env.LOG_LEVEL,
  // In development, use pino-pretty for readable output
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
  // In production, add base fields to every log entry
  ...(!isDevelopment && {
    base: {
      env: env.NODE_ENV,
      service: 'attendance-backend',
    },
  }),
  // Custom serializers — strip sensitive fields
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        id: req.id, // X-Request-ID
      };
    },
    err: pino.stdSerializers.err,
  },
  // Redact sensitive paths from log output
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      '*.password',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
});
