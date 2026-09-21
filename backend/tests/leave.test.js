// backend/tests/leave.test.js
// Integration test suite for Leave Request & Balance endpoints

import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { createTestEmployee, cleanupTestData } from './helpers/testUtils.js';

describe('Leave API Integration Tests', () => {
  let employee;
  let admin;

  beforeAll(async () => {
    await cleanupTestData();

    employee = await createTestEmployee({
      employeeCode: 'LEAVE_EMP_001',
      email: 'leave_emp_001@example.com',
      role: 'EMPLOYEE',
    });

    admin = await createTestEmployee({
      employeeCode: 'LEAVE_ADM_001',
      email: 'leave_adm_001@example.com',
      role: 'ADMIN',
    });
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/leave/my-balances', () => {
    it('should return default leave balances for employee', async () => {
      const res = await request(app)
        .get('/api/leave/my-balances')
        .set('Authorization', `Bearer ${employee.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      const types = res.body.data.map((b) => b.leaveType);
      expect(types).toContain('SICK');
      expect(types).toContain('PERSONAL');
      expect(types).toContain('VACATION');
    });
  });

  describe('POST /api/leave/request', () => {
    it('should create a valid leave request successfully', async () => {
      // Choose weekday dates next month
      const startStr = '2026-11-02'; // Monday
      const endStr = '2026-11-03';   // Tuesday

      const res = await request(app)
        .post('/api/leave/request')
        .set('Authorization', `Bearer ${employee.token}`)
        .send({
          leaveType: 'VACATION',
          startDate: startStr,
          endDate: endStr,
          isHalfDay: false,
          reason: 'Going on family vacation QA',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.leaveType).toBe('VACATION');
    });

    it('should reject when startDate is after endDate', async () => {
      const res = await request(app)
        .post('/api/leave/request')
        .set('Authorization', `Bearer ${employee.token}`)
        .send({
          leaveType: 'SICK',
          startDate: '2026-11-10',
          endDate: '2026-11-05',
          isHalfDay: false,
          reason: 'Invalid date range',
        });

      expect(res.status).toBe(400);
    });

    it('should reject half-day leave spanning multiple dates', async () => {
      const res = await request(app)
        .post('/api/leave/request')
        .set('Authorization', `Bearer ${employee.token}`)
        .send({
          leaveType: 'PERSONAL',
          startDate: '2026-11-04',
          endDate: '2026-11-05',
          isHalfDay: true,
          reason: 'Half day on two dates',
        });

      expect(res.status).toBe(400);
    });

    it('should reject overlapping leave request', async () => {
      // Try to request overlapping with the previous 2026-11-02 to 2026-11-03 request
      const res = await request(app)
        .post('/api/leave/request')
        .set('Authorization', `Bearer ${employee.token}`)
        .send({
          leaveType: 'PERSONAL',
          startDate: '2026-11-03',
          endDate: '2026-11-04',
          isHalfDay: false,
          reason: 'Overlap request',
        });

      expect(res.status).toBe(400);
    });

    it('should reject leave request when quota balance is exceeded', async () => {
      // Create user with 0 days quota
      const lowQuotaUser = await createTestEmployee({
        employeeCode: 'LOW_QUOTA_001',
        email: 'low_quota_001@example.com',
      });

      // Update their vacation balance to 1 day used out of 1
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveType_year: {
            employeeId: lowQuotaUser.employee.id,
            leaveType: 'VACATION',
            year: 2026,
          },
        },
        update: { totalDays: 1, usedDays: 1 },
        create: {
          employeeId: lowQuotaUser.employee.id,
          leaveType: 'VACATION',
          year: 2026,
          totalDays: 1,
          usedDays: 1,
        },
      });

      const res = await request(app)
        .post('/api/leave/request')
        .set('Authorization', `Bearer ${lowQuotaUser.token}`)
        .send({
          leaveType: 'VACATION',
          startDate: '2026-11-16',
          endDate: '2026-11-18', // 3 weekdays
          isHalfDay: false,
          reason: 'Exceeding quota',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/leave/my-requests', () => {
    it('should return employee own leave requests', async () => {
      const res = await request(app)
        .get('/api/leave/my-requests')
        .set('Authorization', `Bearer ${employee.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('Admin Leave Management', () => {
    let targetRequestId;

    beforeAll(async () => {
      // Find the pending request created above
      const reqRecord = await prisma.leaveRequest.findFirst({
        where: { employeeId: employee.employee.id, status: 'PENDING' },
      });
      targetRequestId = reqRecord?.id;
    });

    it('should reject employee from accessing admin requests list', async () => {
      const res = await request(app)
        .get('/api/leave/admin/requests')
        .set('Authorization', `Bearer ${employee.token}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to list all leave requests', async () => {
      const res = await request(app)
        .get('/api/leave/admin/requests')
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should allow admin to approve a leave request', async () => {
      expect(targetRequestId).toBeDefined();

      const res = await request(app)
        .post(`/api/leave/admin/requests/${targetRequestId}/process`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ status: 'APPROVED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('APPROVED');

      // Verify leave balance was deducted
      const balance = await prisma.leaveBalance.findFirst({
        where: {
          employeeId: employee.employee.id,
          leaveType: 'VACATION',
          year: 2026,
        },
      });
      expect(balance.usedDays).toBeGreaterThan(0);
    });

    it('should allow admin to reject a leave request with reason', async () => {
      // Create another pending request
      const rejectTarget = await request(app)
        .post('/api/leave/request')
        .set('Authorization', `Bearer ${employee.token}`)
        .send({
          leaveType: 'PERSONAL',
          startDate: '2026-11-23',
          endDate: '2026-11-23',
          isHalfDay: false,
          reason: 'Personal errand',
        });

      const reqId = rejectTarget.body.data.id;

      const res = await request(app)
        .post(`/api/leave/admin/requests/${reqId}/process`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          status: 'REJECTED',
          rejectReason: 'Urgent release scheduled on that date',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('REJECTED');
      expect(res.body.data.rejectedReason).toBe('Urgent release scheduled on that date');
    });

    it('should allow admin to get and update employee leave balances', async () => {
      const getRes = await request(app)
        .get(`/api/leave/admin/balances/${employee.employee.id}?year=2026`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(getRes.status).toBe(200);
      expect(Array.isArray(getRes.body.data)).toBe(true);

      const putRes = await request(app)
        .put(`/api/leave/admin/balances/${employee.employee.id}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          leaveType: 'VACATION',
          year: 2026,
          totalDays: 15,
        });

      expect(putRes.status).toBe(200);
      expect(putRes.body.data.totalDays).toBe(15);
    });
  });
});
