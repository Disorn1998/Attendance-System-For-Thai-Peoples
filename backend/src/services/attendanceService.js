// src/services/attendanceService.js
// Business logic for Check-in / Check-out

import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAction } from './auditService.js';
import { getWorkDate, nowBangkok, calculateWorkingHours, combineDateTime } from '../utils/dates.js';

/**
 * Perform check-in
 * @param {object} employee 
 * @param {string} ipAddress 
 */
export const checkInService = async (employee, ipAddress) => {
  const { id: employeeId, workShift } = employee;
  
  const now = nowBangkok();
  // Determine logical work date (handles cross-midnight night shift)
  const workDate = getWorkDate(now.toDate(), workShift.startTime, workShift.isNightShift);
  
  // Format for DB query (Date only, UTC midnight)
  // Our dates.js formats it safely, but Prisma @db.Date expects a standard JS Date object.
  const dbWorkDate = new Date(workDate.format('YYYY-MM-DD'));

  // 1. Check if already checked in today
  const existingRecord = await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: dbWorkDate,
    },
  });

  if (existingRecord) {
    throw new AppError('คุณได้ทำการเช็คอินสำหรับวันนี้ไปแล้ว', 400, 'ALREADY_CHECKED_IN');
  }

  // 2. Check if today is an approved leave
  const activeLeave = await prisma.leaveRequest.findFirst({
    where: {
      employeeId,
      status: 'APPROVED',
      startDate: { lte: dbWorkDate },
      endDate: { gte: dbWorkDate },
    },
  });

  if (activeLeave && !activeLeave.isHalfDay) {
    throw new AppError('คุณมีสถานะลางานเต็มวันในวันนี้', 400, 'ON_LEAVE');
  }

  // 3. Determine Status (PRESENT or LATE)
  // Calculate exact expected start time today
  const expectedStartTime = combineDateTime(dbWorkDate, workShift.startTime);
  const lateThreshold = expectedStartTime.add(workShift.lateAfterMinutes, 'minute');
  
  let status = 'PRESENT';
  
  // If it's a half-day leave, they might not be considered late depending on policy.
  // For simplicity: if they have a half-day leave, status is HALF_DAY_LEAVE
  if (activeLeave && activeLeave.isHalfDay) {
    status = 'HALF_DAY_LEAVE';
  } else if (now.isAfter(lateThreshold)) {
    status = 'LATE';
  }

  // 4. Create Record
  // We store checkInTime as UTC (Prisma handles Date objects as UTC safely)
  const attendance = await prisma.attendance.create({
    data: {
      employeeId,
      date: dbWorkDate,
      checkInTime: now.toDate(),
      checkInIp: ipAddress,
      status,
    },
  });

  await logAction({
    userId: employeeId,
    action: 'CHECK_IN',
    entity: 'Attendance',
    entityId: attendance.id,
    ipAddress,
  });

  return attendance;
};

/**
 * Perform check-out
 * @param {object} employee 
 * @param {string} ipAddress 
 */
export const checkOutService = async (employee, ipAddress) => {
  const { id: employeeId, workShift } = employee;
  const now = nowBangkok();
  
  // Determine logical work date (same logic to find today's record)
  const workDate = getWorkDate(now.toDate(), workShift.startTime, workShift.isNightShift);
  const dbWorkDate = new Date(workDate.format('YYYY-MM-DD'));

  // 1. Find today's check-in
  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: dbWorkDate,
    },
  });

  if (!attendance) {
    throw new AppError('ไม่พบข้อมูลการเช็คอิน กรุณาเช็คอินก่อนเช็คเอาต์', 400, 'NO_CHECK_IN');
  }

  if (attendance.checkOutTime) {
    throw new AppError('คุณได้ทำการเช็คเอาต์สำหรับวันนี้ไปแล้ว', 400, 'ALREADY_CHECKED_OUT');
  }

  // 2. Calculate Working Hours
  const workingHours = calculateWorkingHours(attendance.checkInTime, now.toDate());

  // 3. Update Record
  const updatedAttendance = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      checkOutTime: now.toDate(),
      checkOutIp: ipAddress,
      workingHours,
    },
  });

  await logAction({
    userId: employeeId,
    action: 'CHECK_OUT',
    entity: 'Attendance',
    entityId: updatedAttendance.id,
    ipAddress,
  });

  return updatedAttendance;
};

/**
 * Get employee's attendance status for today
 */
export const getTodayStatusService = async (employeeId, workShift) => {
  const now = nowBangkok();
  const workDate = getWorkDate(now.toDate(), workShift.startTime, workShift.isNightShift);
  const dbWorkDate = new Date(workDate.format('YYYY-MM-DD'));

  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: dbWorkDate,
    },
  });

  return {
    workDate: dbWorkDate,
    hasCheckedIn: !!attendance,
    hasCheckedOut: !!attendance?.checkOutTime,
    attendance,
  };
};

/**
 * Get employee's attendance history
 */
export const getMyAttendanceHistoryService = async (employeeId, { month, year }) => {
  const where = { employeeId };
  
  if (month && year) {
    // month is 1-12
    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00Z`);
    
    // Calculate end of month
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Last day of month
    endDate.setHours(23, 59, 59, 999);

    where.date = {
      gte: startDate,
      lte: endDate,
    };
  }

  const records = await prisma.attendance.findMany({
    where,
    orderBy: { date: 'desc' },
  });

  // Calculate summary
  const summary = records.reduce((acc, curr) => {
    acc.totalDays++;
    acc.totalHours += (curr.workingHours || 0);
    
    if (curr.status === 'LATE') acc.lateCount++;
    if (curr.status === 'ABSENT') acc.absentCount++;
    if (curr.status === 'ON_LEAVE' || curr.status === 'HALF_DAY_LEAVE') acc.leaveCount++;
    
    return acc;
  }, { totalDays: 0, totalHours: 0, lateCount: 0, absentCount: 0, leaveCount: 0 });

  return { records, summary };
};
