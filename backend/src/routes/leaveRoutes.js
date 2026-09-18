// src/routes/leaveRoutes.js
import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.js';
import { authorizeRole } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import * as schemas from '../validators/leaveSchema.js';
import { paginationQuerySchema } from '../validators/adminSchema.js'; // reuse pagination schema
import * as leaveController from '../controllers/leaveController.js';

const router = Router();
router.use(authenticateJWT);

// ==================== Employee Routes ====================
router.get('/my-balances', leaveController.getMyBalances);
router.get('/my-requests', validate(paginationQuerySchema, 'query'), leaveController.getMyRequests);
router.post('/request', validate(schemas.createLeaveRequestSchema), leaveController.createRequest);

// ==================== Admin Routes ====================
// Prefix: /admin (Will be mounted as /api/leave/admin)
const adminRouter = Router();
adminRouter.use(authorizeRole(['ADMIN']));

adminRouter.get('/requests', validate(paginationQuerySchema, 'query'), leaveController.getAllRequests);
adminRouter.post('/requests/:id/process', validate(schemas.processLeaveRequestSchema), leaveController.processRequest);
adminRouter.get('/balances/:employeeId', leaveController.getEmployeeBalances);
adminRouter.put('/balances/:employeeId', validate(schemas.updateBalanceSchema), leaveController.updateBalance);

router.use('/admin', adminRouter);

export default router;
