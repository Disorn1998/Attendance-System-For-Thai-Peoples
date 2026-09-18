// src/validators/authSchema.js
// Zod schemas for authentication endpoints.
// Separating schemas from controllers keeps validation logic testable and reusable.

import { z } from 'zod';

/**
 * Login request schema
 * "login" field accepts either email or employeeCode
 */
export const loginSchema = z.object({
  login: z
    .string()
    .min(1, 'กรุณากรอกอีเมลหรือรหัสพนักงาน')
    .max(100, 'ข้อมูลยาวเกินไป'),
  password: z
    .string()
    .min(1, 'กรุณากรอกรหัสผ่าน')
    .max(200, 'รหัสผ่านยาวเกินไป'),
});

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'กรุณากรอกรหัสผ่านปัจจุบัน'),
    newPassword: z
      .string()
      .min(8, 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร')
      .max(200)
      .regex(/[A-Za-z]/, 'รหัสผ่านต้องมีตัวอักษรอย่างน้อย 1 ตัว')
      .regex(/[0-9]/, 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว'),
    confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่านใหม่'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'รหัสผ่านใหม่ไม่ตรงกัน',
    path: ['confirmPassword'],
  });
