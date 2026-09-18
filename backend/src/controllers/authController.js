// src/controllers/authController.js
// Handles HTTP layer for authentication: parse request, call service, send response.
// No business logic here — that lives in authService.js.

import {
  loginService,
  refreshTokenService,
  logoutService,
  changePasswordService,
} from '../services/authService.js';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  verifyAccessToken,
} from '../utils/token.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: เข้าสู่ระบบ
 *     description: ล็อกอินด้วยอีเมล หรือ รหัสพนักงาน + รหัสผ่าน
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [login, password]
 *             properties:
 *               login:
 *                 type: string
 *                 description: อีเมล หรือ รหัสพนักงาน
 *                 example: admin@company.com
 *               password:
 *                 type: string
 *                 example: Admin@1234
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *       401:
 *         description: ข้อมูลไม่ถูกต้อง
 *       429:
 *         description: พยายามเข้าสู่ระบบมากเกินไป
 */
export const login = async (req, res, next) => {
  try {
    const { login, password } = req.body;
    const { accessToken, refreshToken, employee } = await loginService(login, password);

    // Set refresh token as secure httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    sendSuccess(res, { accessToken, employee });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: รีเฟรช Access Token
 *     description: ใช้ refresh token จาก cookie เพื่อรับ access token ใหม่
 *     security: []
 *     responses:
 *       200:
 *         description: ได้รับ access token ใหม่แล้ว
 *       401:
 *         description: Refresh token ไม่ถูกต้องหรือหมดอายุ
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    const { accessToken } = await refreshTokenService(token);
    sendSuccess(res, { accessToken });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: ออกจากระบบ
 *     responses:
 *       200:
 *         description: ออกจากระบบสำเร็จ
 */
export const logout = async (req, res, next) => {
  try {
    // Get the raw token to extract jti for blacklisting
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      await logoutService(decoded);
    }

    // Clear the refresh token cookie
    clearRefreshTokenCookie(res);

    sendSuccess(res, null, 200);
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await changePasswordService(req.user.id, currentPassword, newPassword);
    sendSuccess(res, result, 200, null, 'เปลี่ยนรหัสผ่านสำเร็จ');
  } catch (err) {
    next(err);
  }
};
