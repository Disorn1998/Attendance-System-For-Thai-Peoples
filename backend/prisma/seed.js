// prisma/seed.js
// Seeds the database with initial data for development and testing.
// Run with: npx prisma db seed
// WARNING: This resets all existing data. Do NOT run on production database.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ==================== Clean existing data (in dependency order) ====================
  await prisma.auditLog.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.workShift.deleteMany();
  await prisma.department.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.companyWifiWhitelist.deleteMany();

  // ==================== Departments ====================
  const deptHR = await prisma.department.create({ data: { name: 'ฝ่ายบุคคล (HR)' } });
  const deptIT = await prisma.department.create({ data: { name: 'ฝ่ายไอที (IT)' } });
  const deptFinance = await prisma.department.create({ data: { name: 'ฝ่ายการเงิน (Finance)' } });
  console.log('✅ Departments created');

  // ==================== Work Shifts ====================
  const dayShift = await prisma.workShift.create({
    data: {
      name: 'กะเช้า (Day Shift)',
      startTime: '09:00',
      endTime: '18:00',
      lateAfterMinutes: 15,
      isNightShift: false,
    },
  });

  const nightShift = await prisma.workShift.create({
    data: {
      name: 'กะดึก (Night Shift)',
      startTime: '22:00',
      endTime: '06:00',
      lateAfterMinutes: 15,
      isNightShift: true,
    },
  });
  console.log('✅ Work shifts created');

  // ==================== Employees ====================
  // IMPORTANT: These passwords are for DEVELOPMENT ONLY.
  // Change ALL passwords immediately after first deployment.
  const BCRYPT_ROUNDS = 12;

  const adminPasswordHash = await bcrypt.hash('Admin@1234', BCRYPT_ROUNDS);
  const empPasswordHash = await bcrypt.hash('Pass@1234', BCRYPT_ROUNDS);

  const admin = await prisma.employee.create({
    data: {
      employeeCode: 'ADM001',
      fullName: 'สมชาย แอดมิน',
      email: 'admin@company.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      departmentId: deptHR.id,
      workShiftId: dayShift.id,
      position: 'ผู้ดูแลระบบ',
      isActive: true,
    },
  });

  const emp1 = await prisma.employee.create({
    data: {
      employeeCode: 'EMP001',
      fullName: 'สมหญิง พนักงาน',
      email: 'somying@company.com',
      passwordHash: empPasswordHash,
      role: 'EMPLOYEE',
      departmentId: deptIT.id,
      workShiftId: dayShift.id,
      position: 'นักพัฒนาซอฟต์แวร์',
      isActive: true,
    },
  });

  const emp2 = await prisma.employee.create({
    data: {
      employeeCode: 'EMP002',
      fullName: 'สมศักดิ์ ดีงาม',
      email: 'somsak@company.com',
      passwordHash: empPasswordHash,
      role: 'EMPLOYEE',
      departmentId: deptIT.id,
      workShiftId: dayShift.id,
      position: 'วิศวกรระบบ',
      isActive: true,
    },
  });

  const emp3 = await prisma.employee.create({
    data: {
      employeeCode: 'EMP003',
      fullName: 'สมปอง ใจดี',
      email: 'sompong@company.com',
      passwordHash: empPasswordHash,
      role: 'EMPLOYEE',
      departmentId: deptFinance.id,
      workShiftId: dayShift.id,
      position: 'นักบัญชี',
      isActive: true,
    },
  });

  const emp4 = await prisma.employee.create({
    data: {
      employeeCode: 'EMP004',
      fullName: 'สมพร กลางคืน',
      email: 'somporn@company.com',
      passwordHash: empPasswordHash,
      role: 'EMPLOYEE',
      departmentId: deptIT.id,
      workShiftId: nightShift.id,
      position: 'วิศวกรดูแลระบบกลางคืน',
      isActive: true,
    },
  });
  console.log('✅ Employees created');

  // ==================== Leave Balances (2025) ====================
  const employees = [admin, emp1, emp2, emp3, emp4];
  const currentYear = new Date().getFullYear();

  const leaveBalanceData = [];
  for (const emp of employees) {
    leaveBalanceData.push(
      { employeeId: emp.id, leaveType: 'SICK', year: currentYear, totalDays: 30, usedDays: 0 },
      { employeeId: emp.id, leaveType: 'PERSONAL', year: currentYear, totalDays: 5, usedDays: 0 },
      { employeeId: emp.id, leaveType: 'VACATION', year: currentYear, totalDays: 10, usedDays: 0 }
    );
  }

  await prisma.leaveBalance.createMany({ data: leaveBalanceData });
  console.log('✅ Leave balances created');

  // ==================== WiFi Whitelist ====================
  // NOTE: All 3 loopback variants are needed because Express reports
  // different formats depending on IPv4/IPv6 socket settings.
  await prisma.companyWifiWhitelist.createMany({
    data: [
      { ipAddress: '127.0.0.1', description: 'IPv4 loopback (localhost dev)' },
      { ipAddress: '::1', description: 'IPv6 loopback (localhost dev)' },
      { ipAddress: '::ffff:127.0.0.1', description: 'IPv4-mapped IPv6 loopback (localhost dev)' },
    ],
  });
  console.log('✅ WiFi whitelist created');
  console.log('');
  console.log('⚠️  Add your actual company WiFi IP to the whitelist via Admin panel or SQL:');
  console.log("   INSERT INTO company_wifi_whitelist (ip_address, description) VALUES ('x.x.x.x', 'Office WiFi');");

  // ==================== Thai Public Holidays 2025 ====================
  const holidays2025 = [
    { date: new Date('2025-01-01'), description: 'วันขึ้นปีใหม่' },
    { date: new Date('2025-02-12'), description: 'วันมาฆบูชา' },
    { date: new Date('2025-04-06'), description: 'วันจักรี' },
    { date: new Date('2025-04-13'), description: 'วันสงกรานต์' },
    { date: new Date('2025-04-14'), description: 'วันสงกรานต์' },
    { date: new Date('2025-04-15'), description: 'วันสงกรานต์' },
    { date: new Date('2025-05-01'), description: 'วันแรงงานแห่งชาติ' },
    { date: new Date('2025-05-12'), description: 'วันวิสาขบูชา' },
    { date: new Date('2025-07-10'), description: 'วันอาสาฬหบูชา' },
    { date: new Date('2025-07-28'), description: 'วันเฉลิมพระชนมพรรษา รัชกาลที่ 10' },
    { date: new Date('2025-08-12'), description: 'วันแม่แห่งชาติ' },
    { date: new Date('2025-10-23'), description: 'วันปิยมหาราช' },
    { date: new Date('2025-12-05'), description: 'วันพ่อแห่งชาติ' },
    { date: new Date('2025-12-10'), description: 'วันรัฐธรรมนูญ' },
    { date: new Date('2025-12-31'), description: 'วันสิ้นปี' },
  ];

  await prisma.holiday.createMany({ data: holidays2025 });
  console.log('✅ Holidays 2025 created');

  console.log('');
  console.log('🎉 Database seed completed successfully!');
  console.log('');
  console.log('📋 Seed Accounts (DEVELOPMENT ONLY — change passwords on production):');
  console.log('┌─────────────┬─────────────────────────────┬─────────────┐');
  console.log('│ Role        │ Login                       │ Password    │');
  console.log('├─────────────┼─────────────────────────────┼─────────────┤');
  console.log('│ ADMIN       │ admin@company.com / ADM001  │ Admin@1234  │');
  console.log('│ EMPLOYEE    │ somying@company.com / EMP001│ Pass@1234   │');
  console.log('│ EMPLOYEE    │ somsak@company.com / EMP002 │ Pass@1234   │');
  console.log('│ EMPLOYEE    │ sompong@company.com / EMP003│ Pass@1234   │');
  console.log('│ EMPLOYEE    │ somporn@company.com / EMP004│ Pass@1234   │');
  console.log('└─────────────┴─────────────────────────────┴─────────────┘');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
