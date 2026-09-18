// src/utils/dates.js
// Timezone-aware date utilities.
// All timestamps in the database are stored as UTC.
// All business logic (shift comparison, "is today", etc.) uses Asia/Bangkok.
// This file centralizes timezone conversion to avoid bugs from ad-hoc timezone handling.

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import isBetween from 'dayjs/plugin/isBetween.js';

// Register plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

export const TZ = 'Asia/Bangkok';

/**
 * Get the current date/time in Asia/Bangkok timezone
 * @returns {dayjs.Dayjs}
 */
export const nowBangkok = () => dayjs().tz(TZ);

/**
 * Convert any date to Asia/Bangkok timezone
 * @param {Date|string|dayjs.Dayjs} date
 * @returns {dayjs.Dayjs}
 */
export const toBangkok = (date) => dayjs(date).tz(TZ);

/**
 * Get today's date string in "YYYY-MM-DD" format (Asia/Bangkok)
 * Used as the attendance record date key.
 * @returns {string} e.g. "2025-01-15"
 */
export const todayBangkok = () => nowBangkok().format('YYYY-MM-DD');

/**
 * Parse a time string "HH:mm" into hours and minutes
 * @param {string} timeStr - e.g. "09:00"
 * @returns {{ hours: number, minutes: number }}
 */
export const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
};

/**
 * Combine a date string and a time string into a dayjs object in Bangkok timezone.
 * Useful for comparing shift start/end against actual check-in times.
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {string} timeStr - "HH:mm"
 * @param {number} [dayOffset=0] - Add days (1 = next day, for night shift end time)
 * @returns {dayjs.Dayjs}
 */
export const combineDateTime = (dateStr, timeStr, dayOffset = 0) => {
  const { hours, minutes } = parseTime(timeStr);
  return dayjs.tz(dateStr, TZ).add(dayOffset, 'day').hour(hours).minute(minutes).second(0).millisecond(0);
};

/**
 * Determine the "work date" for a night shift employee who checks in.
 * Night shift: if checkIn time >= shiftStart, work date = today (Bangkok)
 * Otherwise, work date = yesterday (they're still in last night's shift)
 *
 * For day shift, work date is always the current Bangkok date.
 *
 * @param {dayjs.Dayjs} checkInTime - The check-in timestamp (in Bangkok)
 * @param {object} shift - { startTime: "22:00", isNightShift: boolean }
 * @returns {string} "YYYY-MM-DD"
 */
export const getWorkDate = (checkInTime, shift) => {
  if (!shift.isNightShift) {
    return checkInTime.format('YYYY-MM-DD');
  }

  const today = checkInTime.format('YYYY-MM-DD');
  const shiftStart = combineDateTime(today, shift.startTime);

  // If check-in is after shift start today, work date = today
  if (checkInTime.isSameOrAfter(shiftStart)) {
    return today;
  }
  // Otherwise, they are still in yesterday's shift window
  return checkInTime.subtract(1, 'day').format('YYYY-MM-DD');
};

/**
 * Calculate working hours between check-in and check-out.
 * Handles night shift (cross-midnight) correctly.
 * @param {Date} checkInTime - UTC Date
 * @param {Date} checkOutTime - UTC Date
 * @returns {number} Hours worked, rounded to 2 decimal places
 */
export const calculateWorkingHours = (checkInTime, checkOutTime) => {
  const checkIn = dayjs(checkInTime);
  const checkOut = dayjs(checkOutTime);
  const diffMinutes = checkOut.diff(checkIn, 'minute');
  return Math.round((diffMinutes / 60) * 100) / 100;
};

/**
 * Check if a date (in Bangkok TZ) is a weekend (Saturday or Sunday)
 * @param {string|Date|dayjs.Dayjs} date
 * @returns {boolean}
 */
export const isWeekend = (date) => {
  const day = toBangkok(date).day(); // 0=Sunday, 6=Saturday
  return day === 0 || day === 6;
};

/**
 * Get the year in Asia/Bangkok timezone (for leave balance year key)
 * @returns {number}
 */
export const currentYearBangkok = () => nowBangkok().year();
