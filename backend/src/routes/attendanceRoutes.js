// src/routes/attendanceRoutes.js

import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.js';
import { checkCompanyWifi } from '../middlewares/checkWifi.js';
import { checkInRateLimiter } from '../middlewares/rateLimiter.js';
import * as attendanceController from '../controllers/attendanceController.js';

const router = Router();

// Require auth for all attendance routes
router.use(authenticateJWT);

// ==================== Check-in / Check-out ====================
// Uses rate limiting and WiFi check middleware
router.post('/check-in', checkInRateLimiter, checkCompanyWifi, attendanceController.checkIn);
router.post('/check-out', checkInRateLimiter, checkCompanyWifi, attendanceController.checkOut);

// ==================== Status & History ====================
router.get('/today', attendanceController.getTodayStatus);
router.get('/history', attendanceController.getMyHistory);

export default router;
