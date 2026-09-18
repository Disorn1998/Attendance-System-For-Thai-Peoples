// src/jobs/markAbsent.js
// Cron job: automatically marks employees as ABSENT at midnight Bangkok time.
// Runs daily at 00:05 Asia/Bangkok (to ensure it's truly past midnight).
// UTC equivalent: 17:05 UTC (previous day).
//
// Logic:
// For each active, non-deleted employee:
//   - Check if today (Bangkok) has an attendance record
//   - Skip if already has any record (present, late, leave, etc.)
//   - Skip if today is a weekend (Saturday or Sunday)
//   - Skip if today is a public holiday
//   - Skip if employee has an approved leave request covering today
//   - Otherwise: create ABSENT record

import cron from 'node-cron';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { nowBangkok, isWeekend } from '../utils/dates.js';

/**
 * Mark absent for all employees who should have worked today but didn't check in.
 * Can be called manually for testing.
 * @param {string} [targetDateStr] - Optional date override in "YYYY-MM-DD" (Bangkok)
 * @returns {Promise<{ marked: number, skipped: number, errors: number }>}
 */
export const markAbsentJob = async (targetDateStr) => {
  const today = targetDateStr || nowBangkok().format('YYYY-MM-DD');
  const todayDate = new Date(today);

  logger.info({ date: today }, 'Running mark-absent cron job');

  let marked = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Skip if today is weekend
    if (isWeekend(todayDate)) {
      logger.info({ date: today }, 'Mark-absent skipped: weekend');
      return { marked: 0, skipped: 0, errors: 0 };
    }

    // Check if today is a public holiday
    const holiday = await prisma.holiday.findFirst({
      where: { date: todayDate },
    });

    if (holiday) {
      logger.info({ date: today, holiday: holiday.description }, 'Mark-absent skipped: public holiday');
      return { marked: 0, skipped: 0, errors: 0 };
    }

    // Get all active employees
    const activeEmployees = await prisma.employee.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, employeeCode: true, fullName: true },
    });

    for (const employee of activeEmployees) {
      try {
        // Check if attendance record already exists for today
        const existingAttendance = await prisma.attendance.findFirst({
          where: {
            employeeId: employee.id,
            date: todayDate,
          },
        });

        if (existingAttendance) {
          skipped++;
          continue;
        }

        // Check if employee has an approved leave covering today
        const approvedLeave = await prisma.leaveRequest.findFirst({
          where: {
            employeeId: employee.id,
            status: 'APPROVED',
            startDate: { lte: todayDate },
            endDate: { gte: todayDate },
          },
        });

        if (approvedLeave) {
          skipped++;
          continue;
        }

        // Create ABSENT record
        await prisma.attendance.create({
          data: {
            employeeId: employee.id,
            date: todayDate,
            status: 'ABSENT',
          },
        });

        marked++;
        logger.info(
          { employeeId: employee.id, employeeCode: employee.employeeCode, date: today },
          'Employee marked as ABSENT'
        );
      } catch (employeeError) {
        errors++;
        logger.error(
          { employeeId: employee.id, error: employeeError.message, date: today },
          'Failed to mark employee as absent'
        );
      }
    }

    logger.info(
      { date: today, marked, skipped, errors, total: activeEmployees.length },
      'Mark-absent cron job completed'
    );

    return { marked, skipped, errors };
  } catch (err) {
    logger.error({ error: err.message, date: today }, 'Mark-absent cron job failed');
    throw err;
  }
};

// ==================== Schedule Cron ====================
// Run at 00:05 every day in Asia/Bangkok timezone
// Cron expression: minute=5, hour=0, day=*, month=*, weekday=*
// node-cron uses the system TZ set via TZ env var (Asia/Bangkok)
const job = cron.schedule('5 0 * * *', async () => {
  try {
    await markAbsentJob();
  } catch (err) {
    logger.error({ error: err.message }, 'Cron job: markAbsent failed with uncaught error');
  }
}, {
  scheduled: true,
  timezone: 'Asia/Bangkok',
});

logger.info('⏰ Mark-absent cron job scheduled: daily at 00:05 Asia/Bangkok');

export default job;
