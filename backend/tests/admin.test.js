// backend/tests/admin.test.js
// Integration test suite for Admin Master Data and Employee management

import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { createTestEmployee, createTestDepartment, createTestWorkShift, cleanupTestData } from './helpers/testUtils.js';

describe('Admin API Integration Tests', () => {
  let admin;
  let employee;
  let dept;
  let shift;

  beforeAll(async () => {
    await cleanupTestData();

    dept = await createTestDepartment('QA Admin Dept');
    shift = await createTestWorkShift('QA Admin Shift');

    admin = await createTestEmployee({
      employeeCode: 'ADMIN_TEST_001',
      email: 'admin_test_001@example.com',
      role: 'ADMIN',
      departmentId: dept.id,
      workShiftId: shift.id,
    });

    employee = await createTestEmployee({
      employeeCode: 'EMPLOYEE_TEST_001',
      email: 'employee_test_001@example.com',
      role: 'EMPLOYEE',
      departmentId: dept.id,
      workShiftId: shift.id,
    });
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('RBAC Authorization', () => {
    it('should reject employee from accessing admin employees list', async () => {
      const res = await request(app)
        .get('/api/admin/employees')
        .set('Authorization', `Bearer ${employee.token}`);

      expect(res.status).toBe(403);
    });

    it('should reject employee from accessing departments endpoint', async () => {
      const res = await request(app)
        .get('/api/admin/departments')
        .set('Authorization', `Bearer ${employee.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Departments CRUD', () => {
    let createdDeptId;

    it('should create new department', async () => {
      const res = await request(app)
        .post('/api/admin/departments')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'QA Security Dept' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('QA Security Dept');
      createdDeptId = res.body.data.id;
    });

    it('should list all departments', async () => {
      const res = await request(app)
        .get('/api/admin/departments')
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should update department', async () => {
      const res = await request(app)
        .put(`/api/admin/departments/${createdDeptId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'QA Security Dept Renamed' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('QA Security Dept Renamed');
    });

    it('should delete department without active employees', async () => {
      const res = await request(app)
        .delete(`/api/admin/departments/${createdDeptId}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
    });

    it('should reject deleting department with active employees', async () => {
      const res = await request(app)
        .delete(`/api/admin/departments/${dept.id}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(400);
    });
  });

  describe('Work Shifts CRUD', () => {
    let createdShiftId;

    it('should create new work shift', async () => {
      const res = await request(app)
        .post('/api/admin/work-shifts')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          name: 'QA Night Shift Test',
          startTime: '21:00',
          endTime: '05:00',
          lateAfterMinutes: 20,
          isNightShift: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('QA Night Shift Test');
      createdShiftId = res.body.data.id;
    });

    it('should list work shifts', async () => {
      const res = await request(app)
        .get('/api/admin/work-shifts')
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should update work shift', async () => {
      const res = await request(app)
        .put(`/api/admin/work-shifts/${createdShiftId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          name: 'QA Night Shift Updated',
          startTime: '22:00',
          endTime: '06:00',
          lateAfterMinutes: 15,
          isNightShift: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('QA Night Shift Updated');
    });

    it('should delete work shift without assigned employees', async () => {
      const res = await request(app)
        .delete(`/api/admin/work-shifts/${createdShiftId}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Holidays CRUD', () => {
    let createdHolidayId;

    it('should create a new holiday', async () => {
      const res = await request(app)
        .post('/api/admin/holidays')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          date: '2026-12-25',
          description: 'QA Christmas Holiday',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.description).toBe('QA Christmas Holiday');
      createdHolidayId = res.body.data.id;
    });

    it('should list holidays with pagination', async () => {
      const res = await request(app)
        .get('/api/admin/holidays?year=2026')
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should delete holiday', async () => {
      const res = await request(app)
        .delete(`/api/admin/holidays/${createdHolidayId}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
    });
  });

  describe('WiFi Whitelist CRUD', () => {
    let createdWifiId;

    it('should add IP to whitelist', async () => {
      const res = await request(app)
        .post('/api/admin/wifi')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          ipAddress: '192.168.99.100',
          description: 'QA Floor 3 WiFi',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.ipAddress).toBe('192.168.99.100');
      createdWifiId = res.body.data.id;
    });

    it('should list all wifi entries', async () => {
      const res = await request(app)
        .get('/api/admin/wifi')
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should delete wifi whitelist entry', async () => {
      const res = await request(app)
        .delete(`/api/admin/wifi/${createdWifiId}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Employees Management CRUD', () => {
    let newEmpId;

    it('should create a new employee and initialize leave balances', async () => {
      const res = await request(app)
        .post('/api/admin/employees')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          employeeCode: 'QA_NEW_001',
          fullName: 'QA New Person',
          email: 'qa_new_001@example.com',
          password: 'Password@123',
          role: 'EMPLOYEE',
          departmentId: dept.id,
          workShiftId: shift.id,
          position: 'Quality Analyst',
          isActive: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.employeeCode).toBe('QA_NEW_001');
      newEmpId = res.body.data.id;

      // Verify leave balances automatically created
      const balances = await prisma.leaveBalance.findMany({
        where: { employeeId: newEmpId },
      });
      expect(balances.length).toBe(3);
    });

    it('should get employee details by ID', async () => {
      const res = await request(app)
        .get(`/api/admin/employees/${newEmpId}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.employeeCode).toBe('QA_NEW_001');
      expect(res.body.data.passwordHash).toBeUndefined();
    });

    it('should list employees with filter and search', async () => {
      const res = await request(app)
        .get('/api/admin/employees?search=QA_NEW')
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should update employee details', async () => {
      const res = await request(app)
        .put(`/api/admin/employees/${newEmpId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          position: 'Senior Quality Analyst',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.position).toBe('Senior Quality Analyst');
    });

    it('should reject admin self-deletion', async () => {
      const res = await request(app)
        .delete(`/api/admin/employees/${admin.employee.id}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('CANNOT_DELETE_SELF');
    });

    it('should soft-delete employee', async () => {
      const res = await request(app)
        .delete(`/api/admin/employees/${newEmpId}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);

      // Verify soft delete in DB
      const dbRecord = await prisma.employee.findUnique({ where: { id: newEmpId } });
      expect(dbRecord.deletedAt).not.toBeNull();
      expect(dbRecord.isActive).toBe(false);
    });
  });
});
