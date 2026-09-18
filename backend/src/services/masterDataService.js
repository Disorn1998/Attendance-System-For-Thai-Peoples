// src/services/masterDataService.js
// Business logic for Departments, WorkShifts, Holidays, and WiFi Whitelist

import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAction } from './auditService.js';
import { buildPagination } from '../utils/response.js';

// ==================== Department ====================
export const getDepartmentsService = async () => {
  return prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { employees: { where: { deletedAt: null } } } } }
  });
};

export const createDepartmentService = async (data, adminId, ip) => {
  const dept = await prisma.department.create({ data });
  await logAction({ userId: adminId, action: 'CREATE', entity: 'Department', entityId: dept.id, ipAddress: ip });
  return dept;
};

export const updateDepartmentService = async (id, data, adminId, ip) => {
  const dept = await prisma.department.update({ where: { id }, data });
  await logAction({ userId: adminId, action: 'UPDATE', entity: 'Department', entityId: dept.id, ipAddress: ip });
  return dept;
};

export const deleteDepartmentService = async (id, adminId, ip) => {
  // Ensure no active employees in this department
  const count = await prisma.employee.count({ where: { departmentId: id, deletedAt: null } });
  if (count > 0) throw new AppError('ไม่สามารถลบแผนกที่มีพนักงานสังกัดอยู่ได้', 400);
  
  await prisma.department.delete({ where: { id } });
  await logAction({ userId: adminId, action: 'DELETE', entity: 'Department', entityId: id, ipAddress: ip });
};

// ==================== Work Shift ====================
export const getWorkShiftsService = async () => {
  return prisma.workShift.findMany({
    orderBy: { startTime: 'asc' },
    include: { _count: { select: { employees: { where: { deletedAt: null } } } } }
  });
};

export const createWorkShiftService = async (data, adminId, ip) => {
  const shift = await prisma.workShift.create({ data });
  await logAction({ userId: adminId, action: 'CREATE', entity: 'WorkShift', entityId: shift.id, ipAddress: ip });
  return shift;
};

export const updateWorkShiftService = async (id, data, adminId, ip) => {
  const shift = await prisma.workShift.update({ where: { id }, data });
  await logAction({ userId: adminId, action: 'UPDATE', entity: 'WorkShift', entityId: shift.id, ipAddress: ip });
  return shift;
};

export const deleteWorkShiftService = async (id, adminId, ip) => {
  const count = await prisma.employee.count({ where: { workShiftId: id, deletedAt: null } });
  if (count > 0) throw new AppError('ไม่สามารถลบกะเวลาที่มีพนักงานใช้อยู่ได้', 400);
  
  await prisma.workShift.delete({ where: { id } });
  await logAction({ userId: adminId, action: 'DELETE', entity: 'WorkShift', entityId: id, ipAddress: ip });
};

// ==================== Holiday ====================
export const getHolidaysService = async ({ page, limit, year }) => {
  const where = {};
  if (year) {
    const startDate = new Date(`${year}-01-01T00:00:00Z`);
    const endDate = new Date(`${year}-12-31T23:59:59Z`);
    where.date = { gte: startDate, lte: endDate };
  }

  const total = await prisma.holiday.count({ where });
  const { skip, take, ...pagination } = buildPagination(total, page, limit);

  const holidays = await prisma.holiday.findMany({
    where,
    orderBy: { date: 'asc' },
    skip,
    take,
  });

  return { holidays, pagination };
};

export const createHolidayService = async (data, adminId, ip) => {
  const dateObj = new Date(data.date);
  const holiday = await prisma.holiday.create({ data: { date: dateObj, description: data.description } });
  await logAction({ userId: adminId, action: 'CREATE', entity: 'Holiday', entityId: holiday.id, ipAddress: ip });
  return holiday;
};

export const deleteHolidayService = async (id, adminId, ip) => {
  await prisma.holiday.delete({ where: { id } });
  await logAction({ userId: adminId, action: 'DELETE', entity: 'Holiday', entityId: id, ipAddress: ip });
};

// ==================== WiFi Whitelist ====================
export const getWifiWhitelistService = async () => {
  return prisma.companyWifiWhitelist.findMany({ orderBy: { createdAt: 'desc' } });
};

export const createWifiService = async (data, adminId, ip) => {
  const wifi = await prisma.companyWifiWhitelist.create({ data });
  await logAction({ userId: adminId, action: 'CREATE', entity: 'WiFi', entityId: wifi.id, ipAddress: ip });
  return wifi;
};

export const deleteWifiService = async (id, adminId, ip) => {
  await prisma.companyWifiWhitelist.delete({ where: { id } });
  await logAction({ userId: adminId, action: 'DELETE', entity: 'WiFi', entityId: id, ipAddress: ip });
};
