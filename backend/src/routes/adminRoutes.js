// src/routes/adminRoutes.js
// All admin CRUD routes grouped together

import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.js';
import { authorizeRole } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import * as schemas from '../validators/adminSchema.js';
import * as employeeController from '../controllers/employeeController.js';
import * as mdController from '../controllers/masterDataController.js';

const router = Router();

// Apply auth & role middleware to ALL routes in this file
router.use(authenticateJWT, authorizeRole(['ADMIN']));

// ==================== Employees ====================
router.get('/employees', validate(schemas.paginationQuerySchema, 'query'), employeeController.getEmployees);
router.get('/employees/:id', employeeController.getEmployeeById);
router.post('/employees', validate(schemas.createEmployeeSchema), employeeController.createEmployee);
router.put('/employees/:id', validate(schemas.updateEmployeeSchema), employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);

// ==================== Departments ====================
router.get('/departments', mdController.getDepartments);
router.post('/departments', validate(schemas.departmentSchema), mdController.createDepartment);
router.put('/departments/:id', validate(schemas.departmentSchema), mdController.updateDepartment);
router.delete('/departments/:id', mdController.deleteDepartment);

// ==================== Work Shifts ====================
router.get('/work-shifts', mdController.getWorkShifts);
router.post('/work-shifts', validate(schemas.workShiftSchema), mdController.createWorkShift);
router.put('/work-shifts/:id', validate(schemas.workShiftSchema), mdController.updateWorkShift);
router.delete('/work-shifts/:id', mdController.deleteWorkShift);

// ==================== Holidays ====================
router.get('/holidays', validate(schemas.paginationQuerySchema, 'query'), mdController.getHolidays);
router.post('/holidays', validate(schemas.holidaySchema), mdController.createHoliday);
router.delete('/holidays/:id', mdController.deleteHoliday);

// ==================== WiFi Whitelist ====================
router.get('/wifi', mdController.getWifiWhitelist);
router.post('/wifi', validate(schemas.wifiWhitelistSchema), mdController.createWifi);
router.delete('/wifi/:id', mdController.deleteWifi);

export default router;
