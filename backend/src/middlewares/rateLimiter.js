// src/middlewares/rateLimiter.js
// Rate limiting factory — creates different rate limiters for different endpoint groups.
// Uses express-rate-limit with in-memory store (suitable for single VM deployment).
// For multi-instance, switch store to rate-limit-redis.

import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * Rate limiter for login endpoint
 * 5 attempts per 15 minutes per IP — prevents brute force attacks
 */
export const loginRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_LOGIN_WINDOW_MS,
  max: env.NODE_ENV === 'test' ? 1000 : env.RATE_LIMIT_LOGIN_MAX,
  message: {
    success: false,
    message: 'คุณพยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่',
    code: 'TOO_MANY_LOGIN_ATTEMPTS',
  },
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false,
  // Use X-Forwarded-For when behind reverse proxy
  keyGenerator: (req) => req.ip,
});

/**
 * Rate limiter for check-in/check-out endpoints
 * 10 attempts per minute per IP
 */
export const checkInRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_CHECKIN_WINDOW_MS,
  max: env.RATE_LIMIT_CHECKIN_MAX,
  message: {
    success: false,
    message: 'คุณทำรายการบ่อยเกินไป กรุณารอสักครู่',
    code: 'TOO_MANY_REQUESTS',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

/**
 * General API rate limiter (applied globally)
 * 200 requests per minute per IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'คุณส่งคำขอบ่อยเกินไป กรุณารอสักครู่',
    code: 'TOO_MANY_REQUESTS',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});
