// backend/tests/auth.test.js
// Tests for authentication endpoints.
// Uses Supertest to make HTTP requests against the live Express app.

import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { hashPassword } from '../src/utils/password.js';

describe('Auth API', () => {
  let testEmployee;

  beforeAll(async () => {
    // Create a test department and work shift
    const dept = await prisma.department.upsert({
      where: { name: 'Test Dept' },
      update: {},
      create: { name: 'Test Dept' },
    });

    const shift = await prisma.workShift.create({
      data: {
        name: 'Test Shift',
        startTime: '09:00',
        endTime: '18:00',
        lateAfterMinutes: 15,
        isNightShift: false,
      },
    });

    // Create test employee
    testEmployee = await prisma.employee.create({
      data: {
        employeeCode: 'TST001',
        fullName: 'Test Employee',
        email: 'test@example.com',
        passwordHash: await hashPassword('Test@1234'),
        role: 'EMPLOYEE',
        departmentId: dept.id,
        workShiftId: shift.id,
        position: 'Tester',
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.employee.deleteMany({ where: { employeeCode: 'TST001' } });
    await prisma.workShift.deleteMany({ where: { name: 'Test Shift' } });
    await prisma.department.deleteMany({ where: { name: 'Test Dept' } });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'test@example.com', password: 'Test@1234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.employee).toBeDefined();
      expect(res.body.data.employee.passwordHash).toBeUndefined(); // Should not leak hash
    });

    it('should login successfully with employeeCode', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'TST001', password: 'Test@1234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'test@example.com', password: 'WrongPassword123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'nobody@example.com', password: 'Test@1234' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'test@example.com' }); // Missing password

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should set httpOnly refreshToken cookie on success', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'test@example.com', password: 'Test@1234' });

      expect(res.status).toBe(200);
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
    });

    it('should reject inactive employee', async () => {
      // Deactivate the employee
      await prisma.employee.update({
        where: { id: testEmployee.id },
        data: { isActive: false },
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'test@example.com', password: 'Test@1234' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('ACCOUNT_INACTIVE');

      // Restore
      await prisma.employee.update({
        where: { id: testEmployee.id },
        data: { isActive: true },
      });
    });
  });

  describe('GET /api/health', () => {
    it('should return system health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.database).toBe('connected');
      expect(res.body.uptime).toBeGreaterThan(0);
    });
  });
});
