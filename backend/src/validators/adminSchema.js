// src/validators/adminSchema.js
// Validation schemas for Admin CRUD operations

import { z } from 'zod';

// ==================== Department ====================
export const departmentSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อแผนก').max(100),
});

// ==================== Work Shift ====================
export const workShiftSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อกะเวลา').max(100),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'รูปแบบเวลาไม่ถูกต้อง (HH:mm)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'รูปแบบเวลาไม่ถูกต้อง (HH:mm)'),
  lateAfterMinutes: z.number().int().min(0, 'ต้องไม่ต่ำกว่า 0 นาที'),
  isNightShift: z.boolean(),
});

// ==================== Employee ====================
export const createEmployeeSchema = z.object({
  employeeCode: z.string().min(1, 'กรุณากรอกรหัสพนักงาน').max(50),
  fullName: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล').max(150),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  role: z.enum(['EMPLOYEE', 'ADMIN']),
  departmentId: z.number().int().positive(),
  workShiftId: z.number().int().positive(),
  position: z.string().min(1, 'กรุณากรอกตำแหน่ง').max(100),
});

export const updateEmployeeSchema = z.object({
  employeeCode: z.string().min(1, 'กรุณากรอกรหัสพนักงาน').max(50).optional(),
  fullName: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล').max(150).optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional(),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร').optional().or(z.literal('')),
  role: z.enum(['EMPLOYEE', 'ADMIN']).optional(),
  departmentId: z.number().int().positive().optional(),
  workShiftId: z.number().int().positive().optional(),
  position: z.string().min(1, 'กรุณากรอกตำแหน่ง').max(100).optional(),
  isActive: z.boolean().optional(),
});

// ==================== Holiday ====================
export const holidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)'),
  description: z.string().min(1, 'กรุณากรอกรายละเอียดวันหยุด').max(200),
});

// ==================== WiFi Whitelist ====================
export const wifiWhitelistSchema = z.object({
  ipAddress: z.string().min(1, 'กรุณากรอก IP Address').max(50),
  description: z.string().min(1, 'กรุณากรอกรายละเอียด').max(200),
});

// ==================== Pagination Query ====================
export const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional().default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).optional().default('10').transform(Number),
  search: z.string().optional(),
  // For filtering employees
  departmentId: z.string().regex(/^\d+$/).optional().transform((val) => (val ? Number(val) : undefined)),
  isActive: z.enum(['true', 'false']).optional().transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
});
