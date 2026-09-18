// src/utils/token.js
// JWT access + refresh token helpers.
// Access token: short-lived (15m), sent in Authorization header.
// Refresh token: long-lived (7d), stored as httpOnly cookie with SameSite=Strict.
//
// Token blacklist: stored in memory (Map) for simplicity.
// For production with multiple instances, use Redis instead.

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from './logger.js';

// Simple in-memory blacklist for invalidated tokens (logout).
// Key: token jti (JWT ID), Value: expiry timestamp
// This is cleared on server restart — acceptable for single-instance VM deployment.
// For multi-instance, replace with Redis.
const tokenBlacklist = new Map();

// Clean up expired entries every hour to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [jti, expiry] of tokenBlacklist.entries()) {
    if (expiry < now) {
      tokenBlacklist.delete(jti);
    }
  }
}, 60 * 60 * 1000);

/**
 * Generate JWT access token
 * @param {{ id: number, role: string, employeeCode: string }} payload
 * @returns {string}
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(
    { ...payload, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN, jwtid: generateJti() }
  );
};

/**
 * Generate JWT refresh token
 * @param {{ id: number }} payload
 * @returns {string}
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN, jwtid: generateJti() }
  );
};

/**
 * Verify access token
 * @param {string} token
 * @returns {{ id: number, role: string, employeeCode: string, jti: string } | null}
 */
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (decoded.type !== 'access') return null;
    if (tokenBlacklist.has(decoded.jti)) return null;
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Verify refresh token
 * @param {string} token
 * @returns {{ id: number, jti: string } | null}
 */
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') return null;
    if (tokenBlacklist.has(decoded.jti)) return null;
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Blacklist a token by its JTI (JWT ID) — used on logout
 * @param {string} jti
 * @param {number} expiry - Unix timestamp (seconds) when token expires
 */
export const blacklistToken = (jti, expiry) => {
  tokenBlacklist.set(jti, expiry * 1000); // Convert to milliseconds
  logger.debug({ jti }, 'Token blacklisted');
};

/**
 * Set refresh token as httpOnly cookie
 * @param {import('express').Response} res
 * @param {string} refreshToken
 */
export const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/api/auth', // Only sent to auth endpoints
  });
};

/**
 * Clear refresh token cookie
 * @param {import('express').Response} res
 */
export const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
  });
};

/** Generate a random JWT ID */
const generateJti = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
