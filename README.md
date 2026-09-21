# 🏢 ระบบบันทึกเวลาทำงานและลางานพนักงาน (Employee Attendance System)

[![Node.js Version](https://img.shields.io/badge/node.js-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.x-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791.svg)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.14%2B-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4%2B-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-75%2F75%20PASS%20(100%25)-success.svg)](https://jestjs.io/)
[![Coverage](https://img.shields.io/badge/Coverage-86.34%25-brightgreen.svg)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

ระบบบันทึกเวลาเข้า-ออกงาน ลางาน และออกรายงานสำหรับองค์กรขนาดกลางและขนาดใหญ่ (รองรับ 200–500+ พนักงาน) ออกแบบตามมาตรฐาน **Production-Ready** ความปลอดภัยสูง และรองรับการนำไปติดตั้งใช้งานจริงได้ทันที

---

## 🌟 จุดเด่นและฟีเจอร์หลัก (Key Features)

### 1. 🕒 ระบบลงเวลาเข้า-ออกงาน (Attendance & Check-in)
* **IP Whitelist Enforcement:** ตรวจสอบ IP ของ WiFi บริษัทอัตโนมัติแบบ Real-time พนักงานต้องเชื่อมต่ออินเทอร์เน็ตของออฟฟิศเท่านั้นจึงจะบันทึกเวลาได้
* **กะเวลาทำงานยืดหยุ่น (Work Shifts):** รองรับทั้งกะเช้า กะบ่าย และ **กะข้ามคืน (Night Shift)**
* **คำนวณการเข้าสายอัตโนมัติ (Late Grace Period):** ตั้งค่าเกณฑ์ผ่อนปรน (เช่น ไม่เกิน 15 นาที) และคำนวณชั่วโมงทำงานจริงให้อัตโนมัติ

### 2. 🏖️ ระบบยื่นใบลาและโควตาวันลา (Leave Management)
* **โควตาวันลา 3 ประเภท:** ลาป่วย (Sick), ลากิจ (Personal), ลาพักร้อน (Vacation) พร้อมคำนวณวันลาคงเหลือแบบ Real-time
* **รองรับการลาครึ่งวัน (Half-day Leave):** หักโควตา 0.5 วัน และอนุญาตให้เช็คอินเข้างานได้ในวันดังกล่าว
* **Holiday-Aware Calculation:** ระบบคำนวณวันลาและหักยอดเฉพาะ **วันทำงานจริง** (ข้ามวันหยุดเสาร์-อาทิตย์ และวันหยุดนักขัตฤกษ์โดยอัตโนมัติ)
* **Admin Approval Workflow:** แอดมินสามารถตรวจสอบ อนุมัติ หรือปฏิเสธพร้อมระบุเหตุผลได้ทันที

### 3. ⏰ ระบบประมวลผลขาดงานอัตโนมัติ (Automated Cron Job)
* ทำงานทุกคืนเวลา 00:05 น. (Asia/Bangkok) เพื่อตรวจสอบพนักงานที่ไม่ได้ลงเวลาและไม่มีใบลางาน
* ข้ามวันหยุดเสาร์-อาทิตย์ และวันหยุดนักขัตฤกษ์โดยอัตโนมัติ และรองรับ **Idempotency** (รันซ้ำไม่เกิดข้อมูลซ้ำซ้อน)

### 4. 📊 ระบบสรุปผลและรายงาน (Dashboard & Export)
* **Admin Live KPI Dashboard:** สรุปยอด มาปกติ, สาย, ลา, ขาด, และยังไม่ลงเวลาประจำวัน
* **Monthly Attendance Report:** รายงานประวัติการทำงานรายเดือนแยกตามแผนก
* **Export Data:** ส่งออกรายงานเป็นไฟล์ **Excel (.xlsx)** และ **CSV (.csv พร้อม UTF-8 BOM)** รองรับภาษาไทยสมบูรณ์

### 5. 🛡️ สถาปัตยกรรมและความปลอดภัย (Enterprise Security)
* **RBAC (Role-Based Access Control):** แยกสิทธิ์ชัดเจนระหว่าง `EMPLOYEE` และ `ADMIN`
* **JWT Access & Refresh Token:** Access token อายุ 15 นาที, Refresh token เก็บใน `httpOnly`, `SameSite=Strict` Cookie
* **Token Blacklisting on Logout:** ป้องกัน Replay Attack เมื่อผู้ใช้ออกจากระบบ
* **Rate Limiting & Helmet Headers:** ป้องกัน Brute-force Login และโจมตี Web Vulnerabilities
* **PDPA Compliance:** รองรับ Soft-delete พนักงานเพื่อรักษาประวัติข้อมูลตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล

---

## 📊 ผลการทดสอบระบบ (Test Coverage: 86.34%)

```text
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   84.16 |    61.51 |   85.16 |   86.34 |
 src/routes               |  100.00 |    50.00 |  100.00 |  100.00 |
 src/validators           |  100.00 |    50.00 |  100.00 |  100.00 |
 src/services             |   89.83 |    67.24 |   92.72 |   94.16 |
 src/controllers          |   86.25 |    84.37 |  100.00 |   86.60 |
 src/middlewares          |   76.00 |    45.94 |   92.85 |   75.67 |
 src/jobs                 |   77.50 |    80.00 |   50.00 |   77.50 |
--------------------------|---------|----------|---------|---------|
Test Suites: 6 passed, 6 total (72/72 Backend Tests PASS)
Frontend:    1 passed, 1 total (3/3 Vitest Tests PASS)
```

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

* **Backend:** Node.js, Express.js (ESM), PostgreSQL, Prisma ORM, Zod, bcryptjs, jsonwebtoken, ExcelJS, node-cron, Supertest, Jest
* **Frontend:** React 18, Vite, Tailwind CSS, Zustand, Axios, Lucide Icons, Vitest
* **DevOps:** Docker, Docker Compose, Nginx Reverse Proxy, Bash & PowerShell Automation Scripts

---

## 🚀 วิธีการติดตั้งและรันระบบ (Quick Start)

### ความต้องการของระบบ (Prerequisites)
* Node.js >= 20.0.0
* PostgreSQL 15+ หรือ Docker Desktop
* Git

---

### 1. โคลน Repository
```bash
git clone https://github.com/your-username/attendance-system.git
cd attendance-system
```

### 2. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)

#### 🔹 Backend Configuration
คัดลอกไฟล์ `.env.example` เป็น `.env` ในโฟลเดอร์ `backend`:
```bash
cd backend
cp .env.example .env
```
สร้างรหัสสุ่ม 64 ตัวอักษรสำหรับ `JWT_ACCESS_SECRET` และ `JWT_REFRESH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
แก้ไขไฟล์ `backend/.env`:
```env
DATABASE_URL=postgresql://attendance_user:attendance_pass@localhost:5432/attendance_db
JWT_ACCESS_SECRET=your_generated_random_64_char_secret_1
JWT_REFRESH_SECRET=your_generated_random_64_char_secret_2
PORT=3000
NODE_ENV=development
TZ=Asia/Bangkok
CORS_ORIGIN=http://localhost:5173
```

#### 🔹 Frontend Configuration
คัดลอกไฟล์ `.env.example` เป็น `.env` ในโฟลเดอร์ `frontend`:
```bash
cd ../frontend
cp .env.example .env
```
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=ระบบบันทึกเวลาทำงาน
```

---

### 3. ติดตั้ง Dependencies และเริ่มต้น Database

```bash
# ติดตั้ง Backend Dependencies
cd ../backend
npm install

# รัน Database Migrations & ข้อมูลตัวอย่าง (Seed Data)
npx prisma migrate deploy
npx prisma db seed

# ติดตั้ง Frontend Dependencies
cd ../frontend
npm install
```

---

### 4. รันระบบสำหรับ Development

เปิด 2 Terminal:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# API Server รันที่ http://localhost:3000
# Swagger API Docs อยู่ที่ http://localhost:3000/api/api-docs
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Web App รันที่ http://localhost:5173
```

---

## 🔑 บัญชีเข้าใช้งานตัวอย่าง (Default Seed Accounts)

| สิทธิ์ (Role) | อีเมล (Email) / รหัสพนักงาน | รหัสผ่าน (Password) | ตำแหน่ง |
|--------------|-----------------------------|---------------------|---------|
| 👑 **ADMIN** | `admin@company.com` / `ADM001` | `Admin@1234` | ผู้ดูแลระบบ |
| 👤 **EMPLOYEE** | `somying@company.com` / `EMP001` | `Pass@1234` | นักพัฒนาซอฟต์แวร์ |
| 👤 **EMPLOYEE** | `somsak@company.com` / `EMP002` | `Pass@1234` | วิศวกรระบบ |
| 👤 **EMPLOYEE** | `somporn@company.com` / `EMP004` | `Pass@1234` | ดูแลระบบกะดึก (Night Shift) |

*(⚠️ หมายเหตุ: กรุณาเปลี่ยนรหัสผ่านทันทีเมื่อนำขึ้นใช้งานจริงบน Production)*

---

## 🧪 การรันชุดทดสอบ (Testing)

```bash
# รัน Backend Integration Tests ทั้งหมดพร้อม Coverage Report
cd backend
npm run test:coverage

# รัน Frontend Unit Tests
cd ../frontend
npm test

# ทดสอบ Build Frontend สำหรับ Production
npm run build
```

---

## 📦 การสำรองและกู้คืนฐานข้อมูล (Database Backup & Restore)

### 🪟 สำหรับ Windows (PowerShell)
```powershell
# สำรองข้อมูลฐานข้อมูล
powershell -ExecutionPolicy Bypass -File "scripts/backup.ps1"

# กู้คืนฐานข้อมูลจากไฟล์สำรอง
powershell -ExecutionPolicy Bypass -File "scripts/restore.ps1" -BackupFile "backups/backup_attendance_db_xxxx.sql"
```

### 🐧 สำหรับ Linux / Docker
```bash
# สำรองข้อมูล
chmod +x scripts/*.sh
./scripts/backup.sh

# กู้คืนข้อมูล
./scripts/restore.sh backups/backup_xxxx.sql.gz
```

> **คำแนะนำ:** บน Linux Server สามารถตั้ง Cron Job สำรองข้อมูลทุกวันเวลา 01:00 น. ได้ด้วยคำสั่ง:
> `0 1 * * * /path/to/attendance-system/scripts/backup.sh >> /var/log/db_backup.log 2>&1`

---

## 🚢 การนำขึ้นใช้งานจริงด้วย Docker & Nginx (Production Deployment)

1. ตั้งค่า `.env` สำหรับ Production
2. แก้ไขโดเมนใน `nginx/conf.d/default.conf`
3. รันคำสั่ง:
```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

## 📄 License
โปรเจกต์นี้เผยแพร่ภายใต้สัญญาอนุญาต [MIT License](LICENSE) สามารถนำไปพัฒนาต่อยอด ใช้งานส่วนตัว หรือใช้งานในเชิงพาณิชย์ได้อย่างอิสระ
