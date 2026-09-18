// src/config/database.js
// Prisma Client singleton — ensures only one connection pool is created.
// In development, we store the instance on globalThis to survive hot reloads (nodemon).

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const createPrismaClient = () => {
  return new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });
};

// Use globalThis to prevent multiple instances during hot reload in development
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Log slow queries in development
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development' && e.duration > 200) {
    logger.warn({ duration: e.duration, query: e.query }, 'Slow query detected');
  }
});

prisma.$on('error', (e) => {
  logger.error({ message: e.message }, 'Prisma error');
});

/**
 * Test database connectivity — used by health check endpoint
 * @returns {Promise<boolean>}
 */
export const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};
