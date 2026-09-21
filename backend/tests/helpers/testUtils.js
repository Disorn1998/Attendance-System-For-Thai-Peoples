// backend/tests/helpers/testUtils.js
// Utility helpers for Jest integration tests

import { prisma } from '../../src/config/database.js';
import { hashPassword } from '../../src/utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../../src/utils/token.js';

export const createTestDepartment = async (name = 'QA Testing Dept') => {
  return prisma.department.upsert({
    where: { name },
    update: {},
    create: { name },
  });
};

export const createTestWorkShift = async (name = 'QA Work Shift', overrides = {}) => {
  return prisma.workShift.create({
    data: {
      name,
      startTime: '09:00',
      endTime: '18:00',
      lateAfterMinutes: 15,
      isNightShift: false,
      ...overrides,
    },
  });
};

export const createTestEmployee = async ({
  employeeCode = 'EMP_TEST_001',
  fullName = 'Test Employee',
  email = 'emp_test_001@example.com',
  password = 'Pass@1234',
  role = 'EMPLOYEE',
  departmentId,
  workShiftId,
  position = 'Tester',
  isActive = true,
} = {}) => {
  let deptId = departmentId;
  if (!deptId) {
    const dept = await createTestDepartment();
    deptId = dept.id;
  }

  let shiftId = workShiftId;
  if (!shiftId) {
    const shift = await createTestWorkShift();
    shiftId = shift.id;
  }

  const passwordHash = await hashPassword(password);

  const emp = await prisma.employee.create({
    data: {
      employeeCode,
      fullName,
      email,
      passwordHash,
      role,
      departmentId: deptId,
      workShiftId: shiftId,
      position,
      isActive,
    },
    include: {
      department: true,
      workShift: true,
    },
  });

  const token = generateAccessToken({
    id: emp.id,
    role: emp.role,
    employeeCode: emp.employeeCode,
  });

  const refreshToken = generateRefreshToken({ id: emp.id });

  return { employee: emp, token, refreshToken };
};

export const cleanupTestData = async () => {
  try {
    await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { user: { email: { contains: 'test', mode: 'insensitive' } } },
          { user: { employeeCode: { contains: 'TEST' } } },
          { user: { department: { name: { contains: 'QA' } } } },
        ],
      },
    });

    await prisma.attendance.deleteMany({
      where: {
        OR: [
          { employee: { email: { contains: 'test', mode: 'insensitive' } } },
          { employee: { employeeCode: { contains: 'TEST' } } },
          { employee: { department: { name: { contains: 'QA' } } } },
        ],
      },
    });

    await prisma.leaveRequest.deleteMany({
      where: {
        OR: [
          { employee: { email: { contains: 'test', mode: 'insensitive' } } },
          { employee: { employeeCode: { contains: 'TEST' } } },
          { employee: { department: { name: { contains: 'QA' } } } },
        ],
      },
    });

    await prisma.leaveBalance.deleteMany({
      where: {
        OR: [
          { employee: { email: { contains: 'test', mode: 'insensitive' } } },
          { employee: { employeeCode: { contains: 'TEST' } } },
          { employee: { department: { name: { contains: 'QA' } } } },
        ],
      },
    });

    await prisma.employee.deleteMany({
      where: {
        OR: [
          { email: { contains: 'test', mode: 'insensitive' } },
          { employeeCode: { contains: 'TEST' } },
          { department: { name: { contains: 'QA' } } },
        ],
      },
    });

    await prisma.workShift.deleteMany({
      where: { name: { contains: 'QA' } },
    });

    await prisma.department.deleteMany({
      where: { name: { contains: 'QA' } },
    });

    await prisma.holiday.deleteMany({
      where: { description: { contains: 'QA' } },
    });

    await prisma.companyWifiWhitelist.deleteMany({
      where: { description: { contains: 'QA' } },
    });
  } catch (err) {
    // Ignore cleanup errors during test suite lifecycle
  }
};
