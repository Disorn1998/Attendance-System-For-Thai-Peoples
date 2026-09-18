// src/utils/dates.js
// Frontend date formatting utilities.
// Uses dayjs for parsing, formatted for Thai display.

import dayjs from 'dayjs';
import 'dayjs/locale/th.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale('th');

export const TZ = 'Asia/Bangkok';

/**
 * Format a UTC timestamp to Thai date-time display
 * @param {string|Date} date
 * @returns {string} e.g. "15 ม.ค. 2568 09:30"
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  return dayjs(date).tz(TZ).format('D MMM YYYY HH:mm');
};

/**
 * Format time only (HH:mm)
 * @param {string|Date} date
 * @returns {string} e.g. "09:30"
 */
export const formatTime = (date) => {
  if (!date) return '-';
  return dayjs(date).tz(TZ).format('HH:mm');
};

/**
 * Format a date as Thai long format
 * @param {string|Date} date
 * @returns {string} e.g. "15 มกราคม 2568"
 */
export const formatDateLong = (date) => {
  if (!date) return '-';
  return dayjs(date).tz(TZ).format('D MMMM YYYY');
};

/**
 * Format a date for table display (short)
 * @param {string|Date} date
 * @returns {string} e.g. "15/01/2025"
 */
export const formatDateShort = (date) => {
  if (!date) return '-';
  return dayjs(date).tz(TZ).format('DD/MM/YYYY');
};

/**
 * Get relative time (e.g., "3 ชั่วโมงที่แล้ว")
 */
export const fromNow = (date) => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

/**
 * Format working hours as "X ชม. Y นาที"
 * @param {number} hours - Decimal hours e.g. 8.5
 * @returns {string} "8 ชม. 30 นาที"
 */
export const formatWorkingHours = (hours) => {
  if (!hours) return '-';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h} ชม.`;
  return `${h} ชม. ${m} นาที`;
};

/**
 * Get array of months for select dropdown
 */
export const getMonthOptions = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: dayjs().month(i).format('MMMM'),
  }));
};

/**
 * Get current month and year (Bangkok TZ)
 */
export const getCurrentMonthYear = () => {
  const now = dayjs().tz(TZ);
  return { month: now.month() + 1, year: now.year() };
};
