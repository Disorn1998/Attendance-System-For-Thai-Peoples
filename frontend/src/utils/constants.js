// src/utils/constants.js
// Application-wide constants — labels, colors, and mapping tables.
// All user-facing text is in Thai.

// ==================== Attendance Status ====================
export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  LATE: 'LATE',
  ON_LEAVE: 'ON_LEAVE',
  HALF_DAY_LEAVE: 'HALF_DAY_LEAVE',
  ABSENT: 'ABSENT',
};

export const ATTENDANCE_STATUS_LABEL = {
  PRESENT: 'มาทำงาน',
  LATE: 'มาสาย',
  ON_LEAVE: 'ลางาน',
  HALF_DAY_LEAVE: 'ลาครึ่งวัน',
  ABSENT: 'ขาดงาน',
};

export const ATTENDANCE_STATUS_COLOR = {
  PRESENT: 'bg-green-100 text-green-800',
  LATE: 'bg-yellow-100 text-yellow-800',
  ON_LEAVE: 'bg-violet-100 text-violet-800',
  HALF_DAY_LEAVE: 'bg-cyan-100 text-cyan-800',
  ABSENT: 'bg-red-100 text-red-800',
};

// ==================== Leave Type ====================
export const LEAVE_TYPE = {
  SICK: 'SICK',
  PERSONAL: 'PERSONAL',
  VACATION: 'VACATION',
};

export const LEAVE_TYPE_LABEL = {
  SICK: 'ลาป่วย',
  PERSONAL: 'ลากิจ',
  VACATION: 'ลาพักร้อน',
};

// ==================== Leave Status ====================
export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const LEAVE_STATUS_LABEL = {
  PENDING: 'รอการอนุมัติ',
  APPROVED: 'อนุมัติแล้ว',
  REJECTED: 'ปฏิเสธแล้ว',
};

export const LEAVE_STATUS_COLOR = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

// ==================== User Roles ====================
export const ROLE = {
  EMPLOYEE: 'EMPLOYEE',
  ADMIN: 'ADMIN',
};

export const ROLE_LABEL = {
  EMPLOYEE: 'พนักงาน',
  ADMIN: 'ผู้ดูแลระบบ',
};

// ==================== Thai Months ====================
export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

export const THAI_DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
