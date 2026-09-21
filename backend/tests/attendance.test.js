// backend/tests/attendance.test.js
// Integration test suite for Attendance endpoints

import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { createTestEmployee, createTestWorkShift, cleanupTestData } from './helpers/testUtils.js';

describe('Attendance API Integration Tests', () => {
  let employeeUser;
  let adminUser;

  beforeAll(async () => {
    await cleanupTestData();

    // Ensure 127.0.0.1 is in whitelist
    await prisma.companyWifiWhitelist.upsert({
      where: { ipAddress: '127.0.0.1' },
      update: {},
      create: { ipAddress: '127.0.0.1', description: 'QA Localhost' },
    });

    employeeUser = await createTestEmployee({
      employeeCode: 'ATT_TEST_001',
      email: 'att_test_001@example.com',
      role: 'EMPLOYEE',
    });

    adminUser = await createTestEmployee({
      employeeCode: 'ATT_ADMIN_001',
      email: 'att_admin_001@example.com',
      role: 'ADMIN',
    });
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/attendance/today', () => {
    it('should return initial today status before checking in', async () => {
      const res = await request(app)
        .get('/api/attendance/today')
        .set('Authorization', `Bearer ${employeeUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasCheckedIn).toBe(false);
      expect(res.body.data.hasCheckedOut).toBe(false);
      expect(res.body.data.isWifiAllowed).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/attendance/today');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/attendance/check-in', () => {
    it('should check in successfully', async () => {
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${employeeUser.token}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.checkInTime).toBeDefined();
      expect(['PRESENT', 'LATE']).toContain(res.body.data.status);
    });

    it('should reject duplicate check-in on the same work date', async () => {
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${employeeUser.token}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('ALREADY_CHECKED_IN');
    });

    it('should reject check-in from non-whitelisted IP', async () => {
      // Create another user
      const tempUser = await createTestEmployee({
        employeeCode: 'IP_TEST_001',
        email: 'ip_test_001@example.com',
      });

      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${tempUser.token}`)
        .set('X-Forwarded-For', '203.0.113.199'); // Non-whitelisted external IP

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('WIFI_NOT_ALLOWED');
    });
  });

  describe('POST /api/attendance/check-out', () => {
    it('should check out successfully after check-in', async () => {
      const res = await request(app)
        .post('/api/attendance/check-out')
        .set('Authorization', `Bearer ${employeeUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.checkOutTime).toBeDefined();
      expect(res.body.data.workingHours).toBeDefined();
    });

    it('should reject duplicate check-out on the same day', async () => {
      const res = await request(app)
        .post('/api/attendance/check-out')
        .set('Authorization', `Bearer ${employeeUser.token}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('ALREADY_CHECKED_OUT');
    });

    it('should reject check-out without prior check-in', async () => {
      const newUser = await createTestEmployee({
        employeeCode: 'NO_CHECKIN_001',
        email: 'no_checkin_001@example.com',
      });

      const res = await request(app)
        .post('/api/attendance/check-out')
        .set('Authorization', `Bearer ${newUser.token}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('NO_CHECK_IN');
    });
  });

  describe('GET /api/attendance/history', () => {
    it('should return attendance records and summary statistics', async () => {
      const res = await request(app)
        .get('/api/attendance/history')
        .set('Authorization', `Bearer ${employeeUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.records)).toBe(true);
      expect(res.body.data.records.length).toBeGreaterThan(0);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.totalDays).toBeGreaterThan(0);
    });

    it('should filter history by month and year', async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const res = await request(app)
        .get(`/api/attendance/history?month=${month}&year=${year}`)
        .set('Authorization', `Bearer ${employeeUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.records)).toBe(true);
    });
  });

  describe('Leave Status Integration with Check-in', () => {
    it('should reject check-in if user has full-day approved leave today', async () => {
      const leaveUser = await createTestEmployee({
        employeeCode: 'ON_LEAVE_001',
        email: 'on_leave_001@example.com',
      });

      const today = new Date();
      const todayDate = new Date(today.toISOString().slice(0, 10));

      // Create approved full-day leave covering today
      await prisma.leaveRequest.create({
        data: {
          employeeId: leaveUser.employee.id,
          leaveType: 'VACATION',
          startDate: todayDate,
          endDate: todayDate,
          isHalfDay: false,
          reason: 'Full day vacation',
          status: 'APPROVED',
        },
      });

      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${leaveUser.token}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('ON_LEAVE');
    });

    it('should set status HALF_DAY_LEAVE if user has approved half-day leave today', async () => {
      const halfDayUser = await createTestEmployee({
        employeeCode: 'HALF_LEAVE_001',
        email: 'half_leave_001@example.com',
      });

      const today = new Date();
      const todayDate = new Date(today.toISOString().slice(0, 10));

      await prisma.leaveRequest.create({
        data: {
          employeeId: halfDayUser.employee.id,
          leaveType: 'PERSONAL',
          startDate: todayDate,
          endDate: todayDate,
          isHalfDay: true,
          reason: 'Half day personal',
          status: 'APPROVED',
        },
      });

      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${halfDayUser.token}`);

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('HALF_DAY_LEAVE');
    });
  });
});
