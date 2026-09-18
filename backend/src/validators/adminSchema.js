// src/validators/adminSchema.js
// Validation schemas for Admin CRUD operations

import { z } from 'zod';

// ==================== Department ====================
export const departmentSchema = z.object({
  name: z.string().trim().min(1, 'กรุณากรอกชื่อแผนก').max(100),
});

// ==================== Work Shift ====================
export const workShiftSchema = z.object({
  name: z.string().trim().min(1, 'กรุณากรอกชื่อกะเวลา').max(100),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'รูปแบบเวลาไม่ถูกต้อง (HH:mm)').transform((v) => v.slice(0, 5)),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'รูปแบบเวลาไม่ถูกต้อง (HH:mm)').transform((v) => v.slice(0, 5)),
  lateAfterMinutes: z.coerce.number().int().min(0, 'ต้องไม่ต่ำกว่า 0 นาที').default(15),
  isNightShift: z.coerce.boolean().default(false),
});

// ==================== Employee ====================
export const createEmployeeSchema = z.object({
  employeeCode: z.string().trim().min(1, 'กรุณากรอกรหัสพนักงาน').max(50),
  fullName: z.string().trim().min(1, 'กรุณากรอกชื่อ-นามสกุล').max(150),
  email: z.string().trim().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  role: z.enum(['EMPLOYEE', 'ADMIN']).default('EMPLOYEE'),
  departmentId: z.coerce.number().int().positive('กรุณาเลือกแผนกงาน'),
  workShiftId: z.coerce.number().int().positive('กรุณาเลือกกะเวลาทำงาน'),
  position: z.string().trim().min(1, 'กรุณากรอกตำแหน่ง').max(100),
  isActive: z.coerce.boolean().optional().default(true),
});

export const updateEmployeeSchema = z.object({
  employeeCode: z.string().trim().min(1, 'กรุณากรอกรหัสพนักงาน').max(50).optional(),
  fullName: z.string().trim().min(1, 'กรุณากรอกชื่อ-นามสกุล').max(150).optional(),
  email: z.string().trim().email('รูปแบบอีเมลไม่ถูกต้อง').optional(),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร').optional().or(z.literal('')),
  role: z.enum(['EMPLOYEE', 'ADMIN']).optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  workShiftId: z.coerce.number().int().positive().optional(),
  position: z.string().trim().min(1, 'กรุณากรอกตำแหน่ง').max(100).optional(),
  isActive: z.coerce.boolean().optional(),
});

// ==================== Holiday ====================
export const holidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)'),
  description: z.string().trim().min(1, 'กรุณากรอกรายละเอียดวันหยุด').max(200),
});

// ==================== WiFi Whitelist ====================
export const wifiWhitelistSchema = z.object({
  ipAddress: z.string().trim().min(1, 'กรุณากรอก IP Address').max(50),
  description: z.string().trim().min(1, 'กรุณากรอกรายละเอียด').max(200),
});

// ==================== Pagination & Filtering Query ====================
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  // For filtering employees & requests
  departmentId: z.string().regex(/^\d+$/).optional().transform((val) => (val ? Number(val) : undefined)),
  role: z.enum(['EMPLOYEE', 'ADMIN']).optional(),
  isActive: z.enum(['true', 'false']).optional().transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  year: z.coerce.number().int().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});
