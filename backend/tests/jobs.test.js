// backend/tests/jobs.test.js
// Unit/Integration test suite for Background Cron Jobs

import { markAbsentJob } from '../src/jobs/markAbsent.js';
import { prisma } from '../src/config/database.js';
import { createTestEmployee, cleanupTestData } from './helpers/testUtils.js';

describe('Mark Absent Job Tests', () => {
  let emp;

  beforeAll(async () => {
    await cleanupTestData();

    emp = await createTestEmployee({
      employeeCode: 'CRON_TEST_001',
      email: 'cron_test_001@example.com',
    });
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('should skip job when target date is a weekend', async () => {
    // 2026-09-20 is Sunday
    const result = await markAbsentJob('2026-09-20');
    expect(result.marked).toBe(0);
    expect(result.skipped).toBe(0);
  });

  it('should skip job when target date is a public holiday', async () => {
    const holidayDate = new Date('2026-09-23');
    await prisma.holiday.upsert({
      where: { date: holidayDate },
      update: {},
      create: { date: holidayDate, description: 'QA Midweek Holiday' },
    });

    const result = await markAbsentJob('2026-09-23');
    expect(result.marked).toBe(0);

    // Clean up
    await prisma.holiday.deleteMany({ where: { description: 'QA Midweek Holiday' } });
  });

  it('should mark active employees without attendance as ABSENT on regular weekday', async () => {
    // 2026-09-22 is Tuesday
    const testDate = '2026-09-22';
    const result = await markAbsentJob(testDate);

    expect(result.marked).toBeGreaterThan(0);

    const record = await prisma.attendance.findFirst({
      where: {
        employeeId: emp.employee.id,
        date: new Date(testDate),
      },
    });

    expect(record).toBeDefined();
    expect(record.status).toBe('ABSENT');
  });

  it('should be idempotent and not create duplicates when run multiple times', async () => {
    const testDate = '2026-09-22';
    const result = await markAbsentJob(testDate);

    // Should have skipped because record already exists
    expect(result.marked).toBe(0);
    expect(result.skipped).toBeGreaterThan(0);
  });
});
