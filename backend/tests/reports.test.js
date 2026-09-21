// backend/tests/reports.test.js
// Integration test suite for Admin Dashboard and Reports endpoints

import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { createTestEmployee, cleanupTestData } from './helpers/testUtils.js';

describe('Reports API Integration Tests', () => {
  let admin;
  let employee;

  beforeAll(async () => {
    await cleanupTestData();

    admin = await createTestEmployee({
      employeeCode: 'REP_ADM_001',
      email: 'rep_adm_001@example.com',
      role: 'ADMIN',
    });

    employee = await createTestEmployee({
      employeeCode: 'REP_EMP_001',
      email: 'rep_emp_001@example.com',
      role: 'EMPLOYEE',
    });

    // Create a sample attendance record for reports test
    const today = new Date();
    const todayDate = new Date(today.toISOString().slice(0, 10));

    await prisma.attendance.create({
      data: {
        employeeId: employee.employee.id,
        date: todayDate,
        checkInTime: new Date(),
        checkOutTime: new Date(Date.now() + 8 * 3600 * 1000),
        status: 'PRESENT',
        workingHours: 8,
      },
    });
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('RBAC Authorization', () => {
    it('should reject employee from accessing dashboard summary', async () => {
      const res = await request(app)
        .get('/api/reports/dashboard')
        .set('Authorization', `Bearer ${employee.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/reports/dashboard', () => {
    it('should return dashboard summary metrics for today', async () => {
      const res = await request(app)
        .get('/api/reports/dashboard')
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalEmployees).toBeGreaterThan(0);
      expect(res.body.data.today).toBeDefined();
      expect(typeof res.body.data.today.present).toBe('number');
      expect(typeof res.body.data.today.late).toBe('number');
      expect(typeof res.body.data.today.leave).toBe('number');
      expect(typeof res.body.data.today.absent).toBe('number');
    });
  });

  describe('GET /api/reports/monthly', () => {
    it('should return monthly breakdown data', async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const res = await request(app)
        .get(`/api/reports/monthly?month=${month}&year=${year}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const firstRecord = res.body.data[0];
      expect(firstRecord.employeeCode).toBeDefined();
      expect(firstRecord.fullName).toBeDefined();
      expect(typeof firstRecord.present).toBe('number');
      expect(typeof firstRecord.totalHours).toBe('number');
    });

    it('should reject when month or year is missing', async () => {
      const res = await request(app)
        .get('/api/reports/monthly')
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/reports/export', () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    it('should export Excel report (.xlsx)', async () => {
      const res = await request(app)
        .get(`/api/reports/export?month=${month}&year=${year}&format=excel`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('spreadsheetml.sheet');
      expect(res.headers['content-disposition']).toContain('.xlsx');
      expect(res.body).toBeDefined();
    });

    it('should export CSV report with BOM encoding', async () => {
      const res = await request(app)
        .get(`/api/reports/export?month=${month}&year=${year}&format=csv`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('.csv');
      expect(typeof res.text).toBe('string');
      expect(res.text).toContain('รหัสพนักงาน');
    });
  });
});
