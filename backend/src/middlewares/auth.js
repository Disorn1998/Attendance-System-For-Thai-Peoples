// src/middlewares/auth.js
// JWT authentication middleware.
// Extracts Bearer token from Authorization header, verifies it,
// and attaches the decoded user info to req.user.

import { verifyAccessToken } from '../utils/token.js';
import { prisma } from '../config/database.js';

/**
 * Middleware: Verify JWT access token and attach user to request.
 * Usage: router.get('/protected', authenticateJWT, handler)
 */
export const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
        code: 'UNAUTHORIZED',
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่',
        code: 'INVALID_TOKEN',
      });
    }

    // Verify employee still exists and is active
    // We cache this check minimally — fetching every request is safe for 200-300 users
    const employee = await prisma.employee.findFirst({
      where: {
        id: decoded.id,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        role: true,
        employeeCode: true,
        fullName: true,
        departmentId: true,
        workShiftId: true,
        department: { select: { id: true, name: true } },
        workShift: { select: { id: true, name: true, startTime: true, endTime: true, lateAfterMinutes: true, isNightShift: true } },
      },
    });

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'บัญชีผู้ใช้ไม่พบหรือถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
        code: 'ACCOUNT_NOT_FOUND',
      });
    }

    // Attach user info to request for downstream handlers
    req.user = employee;
    next();
  } catch (err) {
    next(err);
  }
};
