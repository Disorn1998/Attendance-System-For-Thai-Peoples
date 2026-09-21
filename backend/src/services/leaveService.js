// src/services/leaveService.js
// Business logic for Leave Requests and Balances

import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAction } from './auditService.js';
import { buildPagination } from '../utils/response.js';
import { getWorkDate } from '../utils/dates.js';

// ==================== Leave Balances ====================

export const getMyLeaveBalances = async (employeeId, year = new Date().getFullYear()) => {
  let balances = await prisma.leaveBalance.findMany({
    where: { employeeId, year },
  });

  if (balances.length === 0) {
    await prisma.leaveBalance.createMany({
      data: [
        { employeeId, leaveType: 'SICK', year, totalDays: 30, usedDays: 0 },
        { employeeId, leaveType: 'PERSONAL', year, totalDays: 6, usedDays: 0 },
        { employeeId, leaveType: 'VACATION', year, totalDays: 6, usedDays: 0 },
      ],
      skipDuplicates: true,
    });
    balances = await prisma.leaveBalance.findMany({
      where: { employeeId, year },
    });
  }

  return balances;
};

export const getEmployeeLeaveBalances = async (employeeId, year = new Date().getFullYear()) => {
  let balances = await prisma.leaveBalance.findMany({
    where: { employeeId, year },
  });

  if (balances.length === 0) {
    await prisma.leaveBalance.createMany({
      data: [
        { employeeId, leaveType: 'SICK', year, totalDays: 30, usedDays: 0 },
        { employeeId, leaveType: 'PERSONAL', year, totalDays: 6, usedDays: 0 },
        { employeeId, leaveType: 'VACATION', year, totalDays: 6, usedDays: 0 },
      ],
      skipDuplicates: true,
    });
    balances = await prisma.leaveBalance.findMany({
      where: { employeeId, year },
    });
  }

  return balances;
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

  // 2. Calculate requested working days (excluding weekends and public holidays)
  let requestedDays = 0;
  if (isHalfDay) {
    if (start.getTime() !== end.getTime()) {
      throw new AppError('การลาครึ่งวันต้องเลือกวันที่เริ่มต้นและสิ้นสุดเป็นวันเดียวกัน', 400);
    }
    requestedDays = 0.5;
  } else {
    const holidays = await prisma.holiday.findMany({
      where: { date: { gte: start, lte: end } },
      select: { date: true },
    });
    const holidayDateSet = new Set(holidays.map((h) => h.date.toISOString().slice(0, 10)));

    let current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dateStr = current.toISOString().slice(0, 10);
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDateSet.has(dateStr)) {
        requestedDays += 1;
      }
      current.setDate(current.getDate() + 1);
    }
  }

  if (requestedDays === 0) {
    throw new AppError('ช่วงเวลาที่เลือกเป็นวันหยุด ไม่จำเป็นต้องยื่นใบลา', 400);
  }

  // 3. Check Balance
  const year = start.getFullYear();
  let balance = await prisma.leaveBalance.findUnique({
    where: { employeeId_leaveType_year: { employeeId, leaveType, year } },
  });

  if (!balance) {
    const defaultDays = leaveType === 'SICK' ? 30 : leaveType === 'VACATION' ? 6 : 6;
    balance = await prisma.leaveBalance.create({
      data: { employeeId, leaveType, year, totalDays: defaultDays, usedDays: 0 },
    });
  }

  if ((balance.totalDays - balance.usedDays) < requestedDays) {
    throw new AppError(`ยอดวันลาประเภทนี้คงเหลือไม่เพียงพอ (ต้องการ ${requestedDays} วัน, คงเหลือ ${balance.totalDays - balance.usedDays} วัน)`, 400);
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
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });

  // Manually attach approvedBy if admin ID is set
  const adminIds = [...new Set(requests.map((r) => r.approvedById).filter(Boolean))];
  let adminMap = {};
  if (adminIds.length > 0) {
    const admins = await prisma.employee.findMany({
      where: { id: { in: adminIds } },
      select: { id: true, fullName: true },
    });
    adminMap = Object.fromEntries(admins.map((a) => [a.id, a]));
  }

  const enhancedRequests = requests.map((r) => ({
    ...r,
    approvedBy: r.approvedById && adminMap[r.approvedById] ? { fullName: adminMap[r.approvedById].fullName } : null,
  }));

  return { requests: enhancedRequests, pagination };
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
    const holidays = await prisma.holiday.findMany({
      where: { date: { gte: request.startDate, lte: request.endDate } },
      select: { date: true },
    });
    const holidayDateSet = new Set(holidays.map((h) => h.date.toISOString().slice(0, 10)));

    let current = new Date(request.startDate);
    while (current <= request.endDate) {
      const dayOfWeek = current.getDay();
      const dateStr = current.toISOString().slice(0, 10);
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDateSet.has(dateStr)) {
        requestedDays += 1;
      }
      current.setDate(current.getDate() + 1);
    }
  }

  // Using transaction to ensure atomic update of request, balance, and attendance
  const updatedRequest = await prisma.$transaction(async (tx) => {
    // 1. Update request status
    const req = await tx.leaveRequest.update({
      where: { id: requestId },
      data: {
        status,
        rejectedReason: rejectReason || null,
        approvedById: adminId,
        approvedAt: new Date(),
      },
    });

    if (status === 'APPROVED') {
      const year = request.startDate.getFullYear();
      
      let balance = await tx.leaveBalance.findUnique({
        where: { employeeId_leaveType_year: { employeeId: request.employeeId, leaveType: request.leaveType, year } },
      });

      if (!balance) {
        const defaultDays = request.leaveType === 'SICK' ? 30 : request.leaveType === 'VACATION' ? 6 : 6;
        balance = await tx.leaveBalance.create({
          data: { employeeId: request.employeeId, leaveType: request.leaveType, year, totalDays: defaultDays, usedDays: 0 },
        });
      }

      if ((balance.totalDays - balance.usedDays) < requestedDays) {
        throw new AppError('ยอดวันลาคงเหลือไม่เพียงพอขณะอนุมัติ', 400);
      }

      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: { usedDays: { increment: requestedDays } },
      });

      // 3. Create Attendance ON_LEAVE records for each weekday in range (excluding holidays)
      const holidays = await tx.holiday.findMany({
        where: { date: { gte: request.startDate, lte: request.endDate } },
        select: { date: true },
      });
      const holidayDateSet = new Set(holidays.map((h) => h.date.toISOString().slice(0, 10)));

      const days = [];
      let current = new Date(request.startDate);
      while (current <= request.endDate) {
        const dayOfWeek = current.getDay();
        const dateStr = current.toISOString().slice(0, 10);
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDateSet.has(dateStr)) {
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
