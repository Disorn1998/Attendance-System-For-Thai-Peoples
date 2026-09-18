// src/app.js
// Express application entry point.
// Sets up middleware chain, routes, and starts the HTTP server.
//
// Middleware order matters:
// 1. Trust proxy (must be first — affects req.ip)
// 2. Security headers (helmet)
// 3. CORS
// 4. Compression
// 5. Request parsing (JSON, cookies)
// 6. Request ID
// 7. General rate limiting
// 8. Routes
// 9. 404 handler
// 10. Centralized error handler (must be last)

// Load and validate environment variables before anything else
import './config/env.js';
import { env } from './config/env.js';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { requestId } from './middlewares/requestId.js';
import { generalRateLimiter } from './middlewares/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';

// Import cron jobs — will be started when module is imported
import './jobs/markAbsent.js';

const app = express();

// ==================== Trust Proxy ====================
// MUST be set before any middleware that uses req.ip.
// '1' means trust the first proxy (Nginx) — only the first hop's IP is trusted.
// This is secure for single-proxy setups (our Linux VM with Nginx).
app.set('trust proxy', 1);

// ==================== Security Headers ====================
// Helmet sets various HTTP headers to protect against common web vulnerabilities.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Required for Swagger UI
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Required for Swagger UI
    },
  },
  crossOriginEmbedderPolicy: false, // Required for Swagger UI assets
}));

// ==================== CORS ====================
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Pre-flight for all routes

// ==================== Compression ====================
app.use(compression());

// ==================== Body Parsing ====================
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser()); // Required for reading httpOnly refresh token cookie

// ==================== Request Tracing ====================
app.use(requestId);

// ==================== Request Logging ====================
// Log every incoming request (dev only — too verbose for production)
if (env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.debug(
      { method: req.method, url: req.url, ip: req.ip, id: req.id },
      'Incoming request'
    );
    next();
  });
}

// ==================== General Rate Limiting ====================
app.use('/api', generalRateLimiter);

// ==================== Routes ====================
app.use('/api', routes);

// Swagger UI is served directly (not under /api for clean URL)
// Handled in routes/index.js

// ==================== 404 Handler ====================
app.use(notFoundHandler);

// ==================== Centralized Error Handler ====================
// Must be LAST — Express identifies 4-arg functions as error handlers
app.use(errorHandler);

// ==================== Start Server ====================
let server;
if (env.NODE_ENV !== 'test') {
  const PORT = env.PORT;
  server = app.listen(PORT, () => {
    logger.info(
      {
        port: PORT,
        env: env.NODE_ENV,
        timezone: env.TZ,
        apiDocs: `http://localhost:${PORT}/api/api-docs`,
      },
      `🚀 Attendance System Backend started`
    );
  });
}

// ==================== Graceful Shutdown ====================
// Handle SIGTERM (Docker stop) and SIGINT (Ctrl+C) gracefully
const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutdown signal received — closing server gracefully');
  server.close(async () => {
    const { prisma } = await import('./config/database.js');
    await prisma.$disconnect();
    logger.info('✅ Server closed. Database disconnected. Goodbye!');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if server doesn't close
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Promise Rejection');
});

export default app;
