// src/services/employeeService.js
// Business logic for managing employees (Admin only)

import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/password.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAction } from './auditService.js';
import { buildPagination } from '../utils/response.js';

/**
 * Get paginated list of employees with optional filters
 */
export const getEmployeesService = async ({ page, limit, search, departmentId, isActive }) => {
  const where = {
    deletedAt: null, // Always exclude soft-deleted
  };

  if (search) {
    where.OR = [
      { employeeCode: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (departmentId !== undefined) where.departmentId = departmentId;
  if (isActive !== undefined) where.isActive = isActive;

  const total = await prisma.employee.count({ where });
  const { skip, take, ...pagination } = buildPagination(total, page, limit);

  const employees = await prisma.employee.findMany({
    where,
    select: {
      id: true,
      employeeCode: true,
      fullName: true,
      email: true,
      role: true,
      position: true,
      isActive: true,
      departmentId: true,
      workShiftId: true,
      department: { select: { id: true, name: true } },
      workShift: { select: { id: true, name: true, startTime: true, endTime: true } },
      createdAt: true,
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });

  return { employees, pagination };
};

/**
 * Get single employee details by ID
 */
export const getEmployeeByIdService = async (id) => {
  const employee = await prisma.employee.findFirst({
    where: { id, deletedAt: null },
    include: {
      department: true,
      workShift: true,
      leaveBalances: {
        where: { year: new Date().getFullYear() }
      }
    },
  });

  if (!employee) throw new AppError('ไม่พบข้อมูลพนักงาน', 404, 'NOT_FOUND');
  
  const { passwordHash, ...safeEmployee } = employee;
  return safeEmployee;
};

/**
 * Create new employee and initialize their leave balances
 */
export const createEmployeeService = async (data, adminId, ipAddress) => {
  const { password, ...employeeData } = data;
  
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Use transaction to ensure employee and leave balances are created together
  const employee = await prisma.$transaction(async (tx) => {
    // 1. Create employee
    const newEmp = await tx.employee.create({
      data: {
        ...employeeData,
        passwordHash: hashedPassword,
      },
    });

    // 2. Initialize leave balances for current year
    const currentYear = new Date().getFullYear();
    await tx.leaveBalance.createMany({
      data: [
        { employeeId: newEmp.id, leaveType: 'SICK', year: currentYear, totalDays: 30, usedDays: 0 },
        { employeeId: newEmp.id, leaveType: 'PERSONAL', year: currentYear, totalDays: 6, usedDays: 0 },
        { employeeId: newEmp.id, leaveType: 'VACATION', year: currentYear, totalDays: 6, usedDays: 0 },
      ],
    });

    return newEmp;
  });

  // Log action
  await logAction({
    userId: adminId,
    action: 'CREATE',
    entity: 'Employee',
    entityId: employee.id,
    details: { after: { employeeCode: employee.employeeCode, email: employee.email } },
    ipAddress,
  });

  const { passwordHash: _, ...safeEmployee } = employee;
  return safeEmployee;
};

/**
 * Update employee details
 */
export const updateEmployeeService = async (id, data, adminId, ipAddress) => {
  // Check if exists
  const existing = await prisma.employee.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('ไม่พบข้อมูลพนักงาน', 404, 'NOT_FOUND');

  const { password, ...updateData } = data;
  
  if (password && password.trim() !== '') {
    updateData.passwordHash = await hashPassword(password);
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: updateData,
  });

  await logAction({
    userId: adminId,
    action: 'UPDATE',
    entity: 'Employee',
    entityId: id,
    details: { 
      before: { role: existing.role, isActive: existing.isActive, departmentId: existing.departmentId },
      after: { role: updated.role, isActive: updated.isActive, departmentId: updated.departmentId } 
    },
    ipAddress,
  });

  const { passwordHash: _, ...safeEmployee } = updated;
  return safeEmployee;
};

/**
 * Soft delete employee
 */
export const deleteEmployeeService = async (id, adminId, ipAddress) => {
  // Prevent self-deletion
  if (id === adminId) {
    throw new AppError('ไม่สามารถลบบัญชีของตนเองได้', 400, 'CANNOT_DELETE_SELF');
  }

  const existing = await prisma.employee.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('ไม่พบข้อมูลพนักงาน', 404, 'NOT_FOUND');

  await prisma.employee.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await logAction({
    userId: adminId,
    action: 'DELETE',
    entity: 'Employee',
    entityId: id,
    details: { message: 'Soft deleted employee' },
    ipAddress,
  });
};
