// src/routes/authRoutes.js
// Auth routes: login, refresh token, logout.
// These endpoints are public (no JWT required) except logout.

import { Router } from 'express';
import { login, refreshToken, logout, changePassword } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, changePasswordSchema } from '../validators/authSchema.js';
import { loginRateLimiter } from '../middlewares/rateLimiter.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

// POST /api/auth/login — rate limited, validated
router.post('/login', loginRateLimiter, validate(loginSchema), login);

// POST /api/auth/refresh — uses httpOnly cookie
router.post('/refresh', refreshToken);

// POST /api/auth/logout — requires valid token (to blacklist it)
router.post('/logout', authenticateJWT, logout);

// POST /api/auth/change-password — authenticated
router.post('/change-password', authenticateJWT, validate(changePasswordSchema), changePassword);

export default router;
