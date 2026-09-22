// backend/tests/helpers/testUtils.js
// Utility helpers for Jest integration tests

import { prisma } from '../../src/config/database.js';
import { hashPassword } from '../../src/utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../../src/utils/token.js';

// Generate a short unique ID per call — avoids any shared-suffix collision
const uid = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const createTestDepartment = async (baseName = 'QA Testing Dept') => {
  // Unique name per call to avoid unique constraint errors
  const name = `${baseName}_${uid()}`;
  return prisma.department.create({ data: { name } });
};

export const createTestWorkShift = async (baseName = 'QA Work Shift', overrides = {}) => {
  // Unique name per call
  const name = `${baseName}_${uid()}`;
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
  employeeCode,
  fullName = 'Test Employee',
  email,
  password = 'Pass@1234',
  role = 'EMPLOYEE',
  departmentId,
  workShiftId,
  position = 'Tester',
  isActive = true,
} = {}) => {
  // Generate unique code/email per invocation to prevent unique constraint errors
  const uniqueSuffix = uid();
  const resolvedCode = employeeCode ?? `TEST_${uniqueSuffix}`;
  const resolvedEmail = email ?? `test_${uniqueSuffix}@example.com`;

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
      employeeCode: resolvedCode,
      fullName,
      email: resolvedEmail,
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
    // Clean in dependency order: child tables first
    await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { user: { email: { contains: 'test', mode: 'insensitive' } } },
          { user: { employeeCode: { startsWith: 'TEST_' } } },
          { user: { department: { name: { startsWith: 'QA ' } } } },
        ],
      },
    });

    await prisma.attendance.deleteMany({
      where: {
        OR: [
          { employee: { email: { contains: 'test', mode: 'insensitive' } } },
          { employee: { employeeCode: { startsWith: 'TEST_' } } },
          { employee: { department: { name: { startsWith: 'QA ' } } } },
        ],
      },
    });

    await prisma.leaveRequest.deleteMany({
      where: {
        OR: [
          { employee: { email: { contains: 'test', mode: 'insensitive' } } },
          { employee: { employeeCode: { startsWith: 'TEST_' } } },
          { employee: { department: { name: { startsWith: 'QA ' } } } },
        ],
      },
    });

    await prisma.leaveBalance.deleteMany({
      where: {
        OR: [
          { employee: { email: { contains: 'test', mode: 'insensitive' } } },
          { employee: { employeeCode: { startsWith: 'TEST_' } } },
          { employee: { department: { name: { startsWith: 'QA ' } } } },
        ],
      },
    });

    await prisma.employee.deleteMany({
      where: {
        OR: [
          { email: { contains: 'test', mode: 'insensitive' } },
          { employeeCode: { startsWith: 'TEST_' } },
          { department: { name: { startsWith: 'QA ' } } },
        ],
      },
    });

    await prisma.workShift.deleteMany({
      where: { name: { startsWith: 'QA ' } },
    });

    await prisma.department.deleteMany({
      where: { name: { startsWith: 'QA ' } },
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
