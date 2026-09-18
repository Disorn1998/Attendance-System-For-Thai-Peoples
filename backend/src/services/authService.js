// src/services/authService.js
// Business logic for authentication.
// Controllers should call service methods — not access Prisma directly.
// This makes testing easier (mock service instead of DB).

import { prisma } from '../config/database.js';
import { comparePassword } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  blacklistToken,
} from '../utils/token.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Authenticate user with email/employeeCode + password.
 * @param {string} login - Email or employee code
 * @param {string} password - Plaintext password
 * @returns {Promise<{ accessToken: string, refreshToken: string, employee: object }>}
 */
export const loginService = async (login, password) => {
  // Find employee by email OR employeeCode (case-insensitive email)
  const employee = await prisma.employee.findFirst({
    where: {
      OR: [
        { email: { equals: login, mode: 'insensitive' } },
        { employeeCode: login },
      ],
      deletedAt: null, // Exclude soft-deleted
    },
    include: {
      department: { select: { id: true, name: true } },
      workShift: { select: { id: true, name: true, startTime: true, endTime: true, isNightShift: true } },
    },
  });

  // Use consistent error message to prevent user enumeration attacks
  const invalidCredentialsError = new AppError(
    'อีเมล/รหัสพนักงาน หรือรหัสผ่านไม่ถูกต้อง',
    401,
    'INVALID_CREDENTIALS'
  );

  if (!employee) throw invalidCredentialsError;

  // Check account is active
  if (!employee.isActive) {
    throw new AppError(
      'บัญชีของคุณถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
      403,
      'ACCOUNT_INACTIVE'
    );
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, employee.passwordHash);
  if (!isPasswordValid) throw invalidCredentialsError;

  // Generate tokens
  const tokenPayload = {
    id: employee.id,
    role: employee.role,
    employeeCode: employee.employeeCode,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken({ id: employee.id });

  logger.info(
    { employeeId: employee.id, employeeCode: employee.employeeCode, role: employee.role },
    'Employee logged in'
  );

  // Return employee data without sensitive fields
  const { passwordHash: _, ...employeeData } = employee;

  return { accessToken, refreshToken, employee: employeeData };
};

/**
 * Issue a new access token using a refresh token.
 * @param {string} refreshToken - From httpOnly cookie
 * @returns {Promise<{ accessToken: string }>}
 */
export const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('ไม่พบ refresh token กรุณาเข้าสู่ระบบใหม่', 401, 'NO_REFRESH_TOKEN');
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw new AppError('Refresh token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่', 401, 'INVALID_REFRESH_TOKEN');
  }

  // Verify employee is still active
  const employee = await prisma.employee.findFirst({
    where: { id: decoded.id, isActive: true, deletedAt: null },
    select: { id: true, role: true, employeeCode: true },
  });

  if (!employee) {
    throw new AppError('บัญชีผู้ใช้ไม่พบหรือถูกปิดการใช้งาน', 401, 'ACCOUNT_NOT_FOUND');
  }

  const accessToken = generateAccessToken({
    id: employee.id,
    role: employee.role,
    employeeCode: employee.employeeCode,
  });

  return { accessToken };
};

/**
 * Logout: blacklist the current access token.
 * Refresh token cookie is cleared by the controller.
 * @param {object} decodedToken - The decoded access token (from req.user or directly)
 */
export const logoutService = async (decodedToken) => {
  if (decodedToken?.jti && decodedToken?.exp) {
    blacklistToken(decodedToken.jti, decodedToken.exp);
  }
  logger.info({ employeeId: decodedToken?.id }, 'Employee logged out');
};

/**
 * Change employee password.
 * @param {number} employeeId
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export const changePasswordService = async (employeeId, currentPassword, newPassword) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new AppError('ไม่พบข้อมูลพนักงาน', 404, 'EMPLOYEE_NOT_FOUND');
  }

  const isMatch = await comparePassword(currentPassword, employee.passwordHash);
  if (!isMatch) {
    throw new AppError('รหัสผ่านปัจจุบันไม่ถูกต้อง', 400, 'INCORRECT_CURRENT_PASSWORD');
  }

  const { hashPassword } = await import('../utils/password.js');
  const newHash = await hashPassword(newPassword);

  await prisma.employee.update({
    where: { id: employeeId },
    data: { passwordHash: newHash },
  });

  logger.info({ employeeId }, 'Employee password changed successfully');
  return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
};
