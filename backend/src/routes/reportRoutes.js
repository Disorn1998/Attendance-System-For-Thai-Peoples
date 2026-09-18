// src/routes/reportRoutes.js
import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.js';
import { authorizeRole } from '../middlewares/authorize.js';
import * as reportController from '../controllers/reportController.js';

const router = Router();
router.use(authenticateJWT, authorizeRole(['ADMIN']));

router.get('/dashboard', reportController.getDashboardSummary);
router.get('/monthly', reportController.getMonthlyReport);
router.get('/export', reportController.exportMonthlyReport);

export default router;
