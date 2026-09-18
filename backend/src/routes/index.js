// src/routes/index.js
// Central route registry — mounts all feature routes under /api.
// Also defines the health check endpoint here for easy access.

import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger.js';
import { checkDatabaseConnection } from '../config/database.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import leaveRoutes from './leaveRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = Router();

// ==================== Health Check ====================
// ... (keep health check) ...
router.get('/health', async (req, res) => {
  const dbConnected = await checkDatabaseConnection();
  const status = dbConnected ? 'ok' : 'degraded';
  const httpStatus = dbConnected ? 200 : 503;

  res.status(httpStatus).json({
    status,
    database: dbConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ==================== Swagger API Documentation ====================
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Attendance System API',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// ==================== Feature Routes ====================
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leave', leaveRoutes);
router.use('/reports', reportRoutes);

export default router;
