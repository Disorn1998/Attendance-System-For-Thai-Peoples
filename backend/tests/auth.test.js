// backend/tests/auth.test.js
// Full integration test suite for Authentication endpoints

import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/database.js';
import { createTestEmployee, cleanupTestData } from './helpers/testUtils.js';

describe('Auth API Integration Tests', () => {
  let user;

  beforeAll(async () => {
    await cleanupTestData();
    user = await createTestEmployee({
      employeeCode: 'AUTH_TEST_001',
      email: 'auth_test_001@example.com',
      password: 'Password@123',
    });
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'auth_test_001@example.com', password: 'Password@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.employee).toBeDefined();
      expect(res.body.data.employee.passwordHash).toBeUndefined();
    });

    it('should login successfully with employeeCode', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'AUTH_TEST_001', password: 'Password@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'auth_test_001@example.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'unknown@example.com', password: 'Password@123' });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject invalid input body', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: '' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should set httpOnly refreshToken cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'auth_test_001@example.com', password: 'Password@123' });

      expect(res.status).toBe(200);
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
    });

    it('should reject inactive accounts', async () => {
      const inactiveUser = await createTestEmployee({
        employeeCode: 'INACTIVE_TEST_001',
        email: 'inactive_test_001@example.com',
        password: 'Password@123',
        isActive: false,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'inactive_test_001@example.com', password: 'Password@123' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('ACCOUNT_INACTIVE');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token using valid refresh token cookie', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${user.refreshToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject refresh when cookie is missing', async () => {
      const res = await request(app).post('/api/auth/refresh');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('NO_REFRESH_TOKEN');
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalid_token_string']);

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('INVALID_REFRESH_TOKEN');
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully when current password is correct', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          currentPassword: 'Password@123',
          newPassword: 'NewPassword@1234',
          confirmPassword: 'NewPassword@1234',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify login with new password works
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ login: 'auth_test_001@example.com', password: 'NewPassword@1234' });
      expect(loginRes.status).toBe(200);
    });

    it('should reject change password when current password is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          currentPassword: 'WrongCurrentPassword',
          newPassword: 'NewPassword@1234',
          confirmPassword: 'NewPassword@1234',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INCORRECT_CURRENT_PASSWORD');
    });

    it('should reject when newPassword and confirmPassword do not match', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          currentPassword: 'NewPassword@1234',
          newPassword: 'NewPassword@1234',
          confirmPassword: 'MismatchPassword@123',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and blacklist token', async () => {
      // Create dedicated user for logout test
      const tempUser = await createTestEmployee({
        employeeCode: 'LOGOUT_TEST_001',
        email: 'logout_test_001@example.com',
        password: 'Password@123',
      });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${tempUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Subsequent request using blacklisted token should fail with 401
      const protectedRes = await request(app)
        .get('/api/attendance/today')
        .set('Authorization', `Bearer ${tempUser.token}`);

      expect(protectedRes.status).toBe(401);
      expect(protectedRes.body.code).toBe('INVALID_TOKEN');
    });
  });

  describe('GET /api/health', () => {
    it('should return 200 and connected database status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.database).toBe('connected');
      expect(res.body.uptime).toBeGreaterThan(0);
    });
  });
});
