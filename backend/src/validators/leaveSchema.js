// src/validators/leaveSchema.js
import { z } from 'zod';

export const createLeaveRequestSchema = z.object({
  leaveType: z.enum(['SICK', 'PERSONAL', 'VACATION', 'OTHER']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)'),
  isHalfDay: z.boolean().default(false),
  reason: z.string().min(1, 'กรุณาระบุเหตุผลการลา').max(500),
});

export const processLeaveRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectReason: z.string().max(255).optional().nullable(),
});

export const updateBalanceSchema = z.object({
  leaveType: z.enum(['SICK', 'PERSONAL', 'VACATION', 'OTHER']),
  year: z.number().int().min(2000).max(2100),
  totalDays: z.number().min(0),
});
