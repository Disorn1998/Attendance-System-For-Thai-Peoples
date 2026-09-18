// src/middlewares/errorHandler.js
// Centralized error handler — catches all errors thrown by controllers/services.
// All errors flow through here to ensure consistent response format.
// Unexpected errors are logged with full details but client only gets a generic message.

import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Custom application error class with HTTP status code and error code
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable Thai message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Machine-readable error code
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Operational errors are expected, system errors are not
  }
}

/**
 * Centralized error handler middleware.
 * Must be registered LAST in the middleware chain (after all routes).
 */
export const errorHandler = (err, req, res, next) => {
  // Operational errors (AppError) — expected business/validation errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return res.status(409).json({
      success: false,
      message: `ข้อมูลนี้มีอยู่ในระบบแล้ว (${field})`,
      code: 'DUPLICATE_ENTRY',
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบข้อมูลที่ต้องการ',
      code: 'NOT_FOUND',
    });
  }

  // Prisma foreign key constraint violation
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลอ้างอิงไม่ถูกต้อง',
      code: 'FOREIGN_KEY_VIOLATION',
    });
  }

  // CORS error
  if (err.message?.includes('not allowed by CORS')) {
    return res.status(403).json({
      success: false,
      message: 'ต้นทางของคำขอไม่ได้รับอนุญาต',
      code: 'CORS_ERROR',
    });
  }

  // Unexpected system error — log full details, return generic message
  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        code: err.code,
      },
      requestId: req.id,
      method: req.method,
      url: req.url,
      userId: req.user?.id,
    },
    'Unexpected system error'
  );

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่ภายหลังหรือติดต่อผู้ดูแลระบบ',
    code: 'INTERNAL_ERROR',
    // Only expose error details in non-production environments
    ...(env.NODE_ENV !== 'production' && {
      debug: { message: err.message, stack: err.stack },
    }),
  });
};

/**
 * Handle 404 Not Found for undefined routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `ไม่พบ endpoint: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
  });
};
