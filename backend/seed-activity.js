// backend/seed-activity.js
// Insert realistic attendance and leave request activity for rich screenshots

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.employee.findMany();
  const emp1 = employees.find(e => e.employeeCode === 'EMP001');
  const emp2 = employees.find(e => e.employeeCode === 'EMP002');
  const emp3 = employees.find(e => e.employeeCode === 'EMP003');
  const emp4 = employees.find(e => e.employeeCode === 'EMP004');
  const admin = employees.find(e => e.role === 'ADMIN');

  const today = new Date();
  const todayDate = new Date(today.toISOString().slice(0, 10));

  // Today check-in for EMP001 (Present)
  if (emp1) {
    const checkInTime = new Date(today);
    checkInTime.setHours(8, 45, 0, 0);
    await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: emp1.id, date: todayDate } },
      update: {},
      create: {
        employeeId: emp1.id,
        date: todayDate,
        checkInTime,
        checkInIp: '127.0.0.1',
        status: 'PRESENT',
      },
    });
  }

  // Today check-in for EMP002 (Late)
  if (emp2) {
    const checkInTime = new Date(today);
    checkInTime.setHours(9, 25, 0, 0);
    await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: emp2.id, date: todayDate } },
      update: {},
      create: {
        employeeId: emp2.id,
        date: todayDate,
        checkInTime,
        checkInIp: '127.0.0.1',
        status: 'LATE',
      },
    });
  }

  // Today Leave for EMP003
  if (emp3) {
    await prisma.leaveRequest.create({
      data: {
        employeeId: emp3.id,
        leaveType: 'VACATION',
        startDate: todayDate,
        endDate: todayDate,
        isHalfDay: false,
        reason: 'พักผ่อนประจำปีต่างจังหวัดกับครอบครัว',
        status: 'APPROVED',
        approvedById: admin?.id,
        approvedAt: new Date(),
      },
    }).catch(() => {});

    await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: emp3.id, date: todayDate } },
      update: {},
      create: {
        employeeId: emp3.id,
        date: todayDate,
        status: 'ON_LEAVE',
      },
    });
  }

  // Pending leave request for Admin approval page from EMP002
  if (emp2) {
    const futureDate1 = new Date(today);
    futureDate1.setDate(futureDate1.getDate() + 3);
    const futureDate2 = new Date(today);
    futureDate2.setDate(futureDate2.getDate() + 4);

    await prisma.leaveRequest.create({
      data: {
        employeeId: emp2.id,
        leaveType: 'PERSONAL',
        startDate: new Date(futureDate1.toISOString().slice(0, 10)),
        endDate: new Date(futureDate2.toISOString().slice(0, 10)),
        isHalfDay: false,
        reason: 'ไปติดต่อธุระราชการที่อำเภอ',
        status: 'PENDING',
      },
    }).catch(() => {});
  }

  // Past attendance records for EMP001 history
  if (emp1) {
    for (let i = 1; i <= 5; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - i);
      if (pastDate.getDay() !== 0 && pastDate.getDay() !== 6) {
        const d = new Date(pastDate.toISOString().slice(0, 10));
        const inTime = new Date(d);
        inTime.setHours(8, 50, 0, 0);
        const outTime = new Date(d);
        outTime.setHours(18, 10, 0, 0);
        await prisma.attendance.upsert({
          where: { employeeId_date: { employeeId: emp1.id, date: d } },
          update: {},
          create: {
            employeeId: emp1.id,
            date: d,
            checkInTime: inTime,
            checkOutTime: outTime,
            checkInIp: '127.0.0.1',
            checkOutIp: '127.0.0.1',
            status: 'PRESENT',
            workingHours: 9.33,
          },
        });
      }
    }
  }

  console.log('✅ Rich sample activity seeded successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
