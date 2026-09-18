// src/services/reportService.js
// Business logic for Admin Dashboard and Reports

import { prisma } from '../config/database.js';
import { nowBangkok, getWorkDate } from '../utils/dates.js';
import ExcelJS from 'exceljs';
import { parse } from 'json2csv';

export const getDashboardSummaryService = async () => {
  const now = nowBangkok();
  const dbToday = new Date(now.format('YYYY-MM-DD'));
  
  // Basic metrics
  const totalEmployees = await prisma.employee.count({ where: { isActive: true, deletedAt: null } });
  
  // Today's attendance
  const todayRecords = await prisma.attendance.findMany({
    where: { date: dbToday },
  });

  const present = todayRecords.filter(r => r.status === 'PRESENT').length;
  const late = todayRecords.filter(r => r.status === 'LATE').length;
  const leave = todayRecords.filter(r => r.status === 'ON_LEAVE' || r.status === 'HALF_DAY_LEAVE').length;
  const absent = todayRecords.filter(r => r.status === 'ABSENT').length;
  
  // Remaining employees who haven't checked in
  const noRecord = totalEmployees - (present + late + leave + absent);

  return {
    totalEmployees,
    today: {
      present,
      late,
      leave,
      absent,
      noRecord: noRecord > 0 ? noRecord : 0,
    }
  };
};

export const getMonthlyReportDataService = async (month, year, departmentId) => {
  // month is 1-12
  const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00Z`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0); // last day
  endDate.setHours(23, 59, 59, 999);

  const where = { isActive: true, deletedAt: null };
  if (departmentId) where.departmentId = Number(departmentId);

  const employees = await prisma.employee.findMany({
    where,
    select: {
      id: true,
      employeeCode: true,
      fullName: true,
      department: { select: { name: true } },
      attendances: {
        where: { date: { gte: startDate, lte: endDate } },
        select: { status: true, workingHours: true }
      }
    },
    orderBy: { employeeCode: 'asc' }
  });

  const reportData = employees.map(emp => {
    let present = 0, late = 0, absent = 0, leave = 0, totalHours = 0;
    
    emp.attendances.forEach(a => {
      if (a.status === 'PRESENT') present++;
      if (a.status === 'LATE') late++;
      if (a.status === 'ABSENT') absent++;
      if (a.status === 'ON_LEAVE' || a.status === 'HALF_DAY_LEAVE') leave++;
      totalHours += (a.workingHours || 0);
    });

    return {
      id: emp.id,
      employeeCode: emp.employeeCode,
      fullName: emp.fullName,
      department: emp.department.name,
      present,
      late,
      absent,
      leave,
      totalHours: Math.round(totalHours * 100) / 100
    };
  });

  return reportData;
};

export const generateExcelReportService = async (data, month, year) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Attendance System';
  const worksheet = workbook.addWorksheet(`Report ${month}-${year}`);

  worksheet.columns = [
    { header: 'รหัสพนักงาน', key: 'employeeCode', width: 15 },
    { header: 'ชื่อ-นามสกุล', key: 'fullName', width: 30 },
    { header: 'แผนก', key: 'department', width: 20 },
    { header: 'มาปกติ (วัน)', key: 'present', width: 15 },
    { header: 'สาย (วัน)', key: 'late', width: 15 },
    { header: 'ลา (วัน)', key: 'leave', width: 15 },
    { header: 'ขาด (วัน)', key: 'absent', width: 15 },
    { header: 'ชั่วโมงทำงานรวม', key: 'totalHours', width: 20 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.addRows(data);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

export const generateCsvReportService = (data) => {
  const fields = [
    { label: 'รหัสพนักงาน', value: 'employeeCode' },
    { label: 'ชื่อ-นามสกุล', value: 'fullName' },
    { label: 'แผนก', value: 'department' },
    { label: 'มาปกติ (วัน)', value: 'present' },
    { label: 'สาย (วัน)', value: 'late' },
    { label: 'ลา (วัน)', value: 'leave' },
    { label: 'ขาด (วัน)', value: 'absent' },
    { label: 'ชั่วโมงทำงานรวม', value: 'totalHours' },
  ];
  return parse(data, { fields, withBOM: true }); // withBOM helps Excel read UTF-8 CSVs
};
