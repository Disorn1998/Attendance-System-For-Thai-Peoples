// src/services/leaveService.js
// Business logic for Leave Requests and Balances

import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAction } from './auditService.js';
import { buildPagination } from '../utils/response.js';
import { getWorkDate } from '../utils/dates.js';

// ==================== Leave Balances ====================

export const getMyLeaveBalances = async (employeeId, year = new Date().getFullYear()) => {
  return prisma.leaveBalance.findMany({
    where: { employeeId, year },
  });
};

export const getEmployeeLeaveBalances = async (employeeId, year = new Date().getFullYear()) => {
  return prisma.leaveBalance.findMany({
    where: { employeeId, year },
  });
};

export const updateLeaveBalance = async (employeeId, leaveType, year, totalDays, adminId, ipAddress) => {
  const balance = await prisma.leaveBalance.upsert({
    where: {
      employeeId_leaveType_year: { employeeId, leaveType, year },
    },
    update: { totalDays },
    create: { employeeId, leaveType, year, totalDays, usedDays: 0 },
  });

  await logAction({
    userId: adminId,
    action: 'UPDATE_LEAVE_BALANCE',
    entity: 'LeaveBalance',
    entityId: balance.id,
    details: { employeeId, leaveType, year, newTotal: totalDays },
    ipAddress,
  });

  return balance;
};

// ==================== Leave Requests (Employee) ====================

export const getMyLeaveRequests = async (employeeId, { page, limit }) => {
  const total = await prisma.leaveRequest.count({ where: { employeeId } });
  const { skip, take, ...pagination } = buildPagination(total, page, limit);

  const requests = await prisma.leaveRequest.findMany({
    where: { employeeId },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });

  return { requests, pagination };
};

export const createLeaveRequest = async (employeeId, data, ipAddress) => {
  const { leaveType, startDate, endDate, isHalfDay, reason } = data;
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 1. Validate dates
  if (start > end) {
    throw new AppError('วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น', 400);
  }

  // 2. Calculate requested days
  let requestedDays = 0;
  if (isHalfDay) {
    if (start.getTime() !== end.getTime()) {
      throw new AppError('การลาครึ่งวันต้องเลือกวันที่เริ่มต้นและสิ้นสุดเป็นวันเดียวกัน', 400);
    }
    requestedDays = 0.5;
  } else {
    // Simple calc (excluding weekends/holidays should ideally be done here, 
    // but for simplicity we calculate calendar days)
    const diffTime = Math.abs(end - start);
    requestedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  // 3. Check Balance
  const year = start.getFullYear();
  const balance = await prisma.leaveBalance.findUnique({
    where: { employeeId_leaveType_year: { employeeId, leaveType, year } },
  });

  if (!balance || (balance.totalDays - balance.usedDays) < requestedDays) {
    throw new AppError(`ยอดวันลาประเภทนี้คงเหลือไม่เพียงพอ (ต้องการ ${requestedDays} วัน)`, 400);
  }

  // 4. Check overlapping requests
  const overlapping = await prisma.leaveRequest.findFirst({
    where: {
      employeeId,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        { startDate: { lte: end }, endDate: { gte: start } },
      ],
    },
  });

  if (overlapping) {
    throw new AppError('คุณมีใบลาในช่วงเวลานี้อยู่แล้ว', 400);
  }

  // 5. Create Request
  const request = await prisma.leaveRequest.create({
    data: {
      employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      isHalfDay,
      reason,
      status: 'PENDING',
    },
  });

  await logAction({
    userId: employeeId,
    action: 'CREATE',
    entity: 'LeaveRequest',
    entityId: request.id,
    ipAddress,
  });

  return request;
};

// ==================== Leave Requests (Admin) ====================

export const getAllLeaveRequests = async ({ page, limit, status, departmentId }) => {
  const where = {};
  if (status) where.status = status;
  if (departmentId) where.employee = { departmentId: Number(departmentId) };

  const total = await prisma.leaveRequest.count({ where });
  const { skip, take, ...pagination } = buildPagination(total, page, limit);

  const requests = await prisma.leaveRequest.findMany({
    where,
    include: {
      employee: { select: { id: true, fullName: true, employeeCode: true, department: { select: { name: true } } } },
      approvedBy: { select: { fullName: true } }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });

  return { requests, pagination };
};

export const processLeaveRequest = async (requestId, { status, rejectReason }, adminId, ipAddress) => {
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new AppError('สถานะไม่ถูกต้อง', 400);
  }

  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: { employee: true },
  });

  if (!request) throw new AppError('ไม่พบใบลา', 404);
  if (request.status !== 'PENDING') throw new AppError('ใบนี้ถูกดำเนินการไปแล้ว', 400);

  let requestedDays = 0;
  if (request.isHalfDay) {
    requestedDays = 0.5;
  } else {
    const diffTime = Math.abs(request.endDate - request.startDate);
    requestedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  // Using transaction to ensure atomic update of request, balance, and attendance
  const updatedRequest = await prisma.$transaction(async (tx) => {
    // 1. Update request status
    const req = await tx.leaveRequest.update({
      where: { id: requestId },
      data: { status, rejectReason, approvedById: adminId },
    });

    if (status === 'APPROVED') {
      const year = request.startDate.getFullYear();
      
      // 2. Deduct Balance
      const balance = await tx.leaveBalance.findUnique({
        where: { employeeId_leaveType_year: { employeeId: request.employeeId, leaveType: request.leaveType, year } },
      });

      if (!balance || (balance.totalDays - balance.usedDays) < requestedDays) {
        throw new AppError('ยอดวันลาคงเหลือไม่เพียงพอขณะอนุมัติ', 400);
      }

      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: { usedDays: { increment: requestedDays } },
      });

      // 3. Create Attendance ON_LEAVE records for each day in range
      const days = [];
      let current = new Date(request.startDate);
      while (current <= request.endDate) {
        // Only mark if it's a weekday (in real app, skip holidays too)
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          days.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }

      const attendanceStatus = request.isHalfDay ? 'HALF_DAY_LEAVE' : 'ON_LEAVE';
      
      for (const d of days) {
        await tx.attendance.upsert({
          where: { employeeId_date: { employeeId: request.employeeId, date: d } },
          update: { status: attendanceStatus }, // override if ABSENT etc.
          create: {
            employeeId: request.employeeId,
            date: d,
            status: attendanceStatus,
          },
        });
      }
    }

    return req;
  });

  await logAction({
    userId: adminId,
    action: `LEAVE_${status}`,
    entity: 'LeaveRequest',
    entityId: updatedRequest.id,
    ipAddress,
  });

  return updatedRequest;
};
