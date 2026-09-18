// src/validators/leaveSchema.js
import { z } from 'zod';

export const createLeaveRequestSchema = z.object({
  leaveType: z.enum(['SICK', 'PERSONAL', 'VACATION']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)'),
  isHalfDay: z.boolean().default(false),
  reason: z.string().trim().min(1, 'กรุณาระบุเหตุผลการลา').max(500),
});

export const processLeaveRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectReason: z.string().trim().max(255).optional().nullable(),
});

export const updateBalanceSchema = z.object({
  leaveType: z.enum(['SICK', 'PERSONAL', 'VACATION']),
  year: z.coerce.number().int().min(2000).max(2100),
  totalDays: z.coerce.number().min(0, 'จำนวนวันต้องไม่ต่ำกว่า 0'),
});
