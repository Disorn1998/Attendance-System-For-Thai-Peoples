# 🏢 Enterprise Employee Attendance & Leave Management System
### ระบบบันทึกเวลาทำงาน ลางาน และออกรายงานสำหรับองค์กร (Full-Stack Production-Ready)

[![Node.js Version](https://img.shields.io/badge/node.js-%3E%3D20.0.0-339933.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.x-61DAFB.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.14%2B-2D3748.svg?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4%2B-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-75%2F75%20PASS%20(100%25)-success.svg?style=flat-square&logo=jest)](https://jestjs.io/)
[![Code Coverage](https://img.shields.io/badge/Coverage-86.34%25-brightgreen.svg?style=flat-square)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📖 สารบัญ (Table of Contents)

1. [ภาพรวมของระบบ (Overview)](#-ภาพรวมของระบบ-overview)
2. [ฟีเจอร์เด่นของระบบ (Key Features)](#-ฟีเจอร์เด่นของระบบ-key-features)
3. [เทคโนโลยีและสถาปัตยกรรม (Tech Stack & Architecture)](#-เทคโนโลยีและสถาปัตยกรรม-tech-stack--architecture)
4. [โครงสร้างโปรเจกต์ (Project Structure)](#-โครงสร้างโปรเจกต์-project-structure)
5. [ความต้องการของระบบ (Prerequisites)](#-ความต้องการของระบบ-prerequisites)
6. [คู่มือการติดตั้งและเริ่มต้นใช้งาน (Installation & Quick Start)](#-คู่มือการติดตั้งและเริ่มต้นใช้งาน-installation--quick-start)
7. [การตั้งค่า Environment Variables (.env)](#-การตั้งค่า-environment-variables-env)
8. [ข้อมูลบัญชีผู้ใช้ทดสอบ (Seed Accounts)](#-ข้อมูลบัญชีผู้ใช้ทดสอบ-seed-accounts)
9. [คู่มือการใช้งานอย่างละเอียด (User Manual)](#-คู่มือการใช้งานอย่างละเอียด-user-manual)
   - [สำหรับพนักงาน (Employee Guide)](#1-สำหรับพนักงาน-employee-guide)
   - [สำหรับผู้ดูแลระบบ (Admin Guide)](#2-สำหรับผู้ดูแลระบบ-admin-guide)
10. [ระบบประมวลผลอัตโนมัติ (Automated Cron Job)](#-ระบบประมวลผลอัตโนมัติ-automated-cron-job)
11. [การสำรองและกู้คืนฐานข้อมูล (Backup & Restore)](#-การสำรองและกู้คืนฐานข้อมูล-backup--restore)
12. [การทดสอบและผล Code Coverage (Testing & QA)](#-การทดสอบและผล-code-coverage-testing--qa)
13. [การนำขึ้นใช้งานจริงบน Production (Production Deployment)](#-การนำขึ้นใช้งานจริงบน-production-production-deployment)
14. [การแก้ไขปัญหาที่พบบ่อย (Troubleshooting & FAQ)](#-การแก้ไขปัญหาที่พบบ่อย-troubleshooting--faq)
15. [สัญญาอนุญาต (License)](#-สัญญาอนุญาต-license)

---

## 🎯 ภาพรวมของระบบ (Overview)

**Employee Attendance System** คือระบบจัดการและบันทึกเวลาการทำงานของพนักงานที่ออกแบบมาเพื่อตอบโจทย์องค์กรขนาดกลางและขนาดใหญ่ (200 - 500+ คน) ที่ต้องการความถูกต้อง ความปลอดภัย และความสะดวกในการใช้งาน 

ตัวระบบรองรับการเชื่อมต่อแบบ **Real-time**, การตรวจสอบพิกัดเครือข่ายอินเทอร์เน็ตของบริษัท (**WiFi IP Whitelist Enforcement**), การจัดการกะเวลาหลากหลายรูปแบบรวมถึงกะกลางคืน (**Night Shift**), การคำนวณวันลาที่คำนึงถึงวันหยุดนักขัตฤกษ์ (**Holiday-Aware**), และการส่งออกรายงานในรูปแบบ **Excel (.xlsx)** และ **CSV** ที่รองรับภาษาไทย 100%

---

## ✨ ฟีเจอร์เด่นของระบบ (Key Features)

### 👤 ฝั่งพนักงาน (Employee Portal)
* **Digital Live Clock & One-Click Attendance:** หน้าแดชบอร์ดแสดงนาฬิกาตามเวลาจริงในเขตเวลาประเทศไทย (Asia/Bangkok) พร้อมปุ่มกดบันทึกเวลาเข้า-ออกงานขนาดพอดี ใช้งานง่ายบนมือถือและแท็บเล็ต
* **Dynamic WiFi Whitelist Status:** ระบบตรวจสอบ IP Address ที่ใช้งานแบบ Real-time แสดงสถานะชัดเจนว่าเชื่อมต่ออินเทอร์เน็ตของบริษัทแล้วหรือไม่ ป้องกันการลงเวลาจากภายนอก
* **ระบบยื่นคำขอลางาน (Leave Requests):** ยื่นใบลาได้ 3 ประเภท (ลาป่วย, ลากิจ, ลาพักร้อน) รองรับการลาเต็มวันและการลาครึ่งวัน (Half-Day) พร้อมตรวจสอบยอดวันลาคงเหลืออัตโนมัติ
* **ตรวจสอบประวัติการลงเวลา (Attendance History):** ดูประวัติการลงเวลาเข้า-ออกงาน, ชั่วโมงการทำงานรวม, และสถิติการมาสายย้อนหลังรายเดือน

### 👑 ฝั่งผู้ดูแลระบบ (Admin Panel)
* **Real-time KPI Dashboard:** แสดงตัวเลขสรุปภาพรวมรายวันแบบ Real-time (มาทำงานปกติ, สาย, ลางาน, ขาดงาน, และยังไม่ลงเวลา)
* **Workflow อนุมัติการลา (Leave Approval):** แอดมินสามารถตรวจสอบรายการใบลาของพนักงานทั้งหมด ตรวจสอบวันลาคงเหลือ และกดอนุมัติ (ระบบจะหักโควตาวันลาและอัปเดตประวัติการเข้างานให้อัตโนมัติ) หรือปฏิเสธพร้อมระบุเหตุผล
* **จัดการข้อมูลพนักงาน (Employee Management):** เพิ่ม, แก้ไข, ระงับการใช้งาน, และ Soft-delete พนักงานตามมาตรฐาน PDPA พร้อมสร้างโควตาวันลาเริ่มต้นให้อัตโนมัติ
* **จัดการกะการทำงาน (Work Shifts):** กำหนดเวลาเริ่ม-เลิกงาน, เกณฑ์ผ่อนปรนการเข้าสาย (Late Grace Period เช่น 15 นาที), และรองรับกะข้ามคืน (Night Shift)
* **จัดการแผนกและวันหยุด (Departments & Holidays):** เพิ่ม-ลบแผนก และปฏิทินวันหยุดประจำปีเพื่อใช้คำนวณวันลาและวันทำงาน
* **จัดการ WiFi IP Whitelist:** กำหนดรายการ IP Address ที่อนุญาตให้เช็คอินได้จากหน้าเว็บ
* **ระบบออกรายงาน (Export Reports):** สร้างรายงานสรุปการทำงานประจำเดือน ส่งออกเป็นไฟล์ **Excel (.xlsx)** และ **CSV (UTF-8 with BOM)** 

### 🛡️ ความปลอดภัยระดับองค์กร (Security & Architecture)
* **Authentication:** ใช้ **JWT Access Token (15m)** คู่กับ **Refresh Token (7d)** ใน `httpOnly`, `SameSite=Strict` Cookie
* **Token Blacklisting:** ระบบ Blacklist Token ในหน่วยความจำเมื่อผู้ใช้กด Logout เพื่อป้องกัน Replay Attack
* **Rate Limiting:** ป้องกัน Brute-force Login และ DDoS ด้วย Express Rate Limit
* **Data Protection:** เข้ารหัสรหัสผ่านด้วย `bcryptjs` (Cost Factor: 12) และรองรับ Soft-delete ไม่ลบข้อมูลถาวร

---

## 🛠️ เทคโนโลยีและสถาปัตยกรรม (Tech Stack & Architecture)

```
[ Frontend: React + Vite + Tailwind CSS ]
                   │
                   ▼  (HTTP / JSON REST API with httpOnly Cookies)
[ Nginx Reverse Proxy / SSL Termination ]
                   │
                   ▼
[ Backend: Node.js + Express.js (ESM) ]
   ├── JWT Auth & In-Memory Token Blacklist
   ├── Business Logic & Validation (Zod)
   ├── Background Cron Job (node-cron)
   └── Prisma ORM Client
                   │
                   ▼  (Connection Pool / Port 5432)
[ PostgreSQL Database (ACID Compliant) ]
```

| เลเยอร์ | เทคโนโลยีที่เลือกใช้ | รายละเอียดการใช้งาน |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | Single Page Application (SPA) โหลดเร็วและ Build ใน 1.3 วินาที |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Responsive Design รองรับ Mobile, Tablet, Desktop |
| **State Management** | Zustand | จัดการ Authentication State และ User Context |
| **HTTP Client** | Axios | มี Interceptors รองรับการทำ Auto Token Refresh เมื่อ Token หมดอายุ |
| **Backend Framework** | Node.js (v20+) + Express.js | สถาปัตยกรรมแบบ Modular Service-Controller Architecture |
| **Database & ORM** | PostgreSQL 15+ & Prisma ORM | การันตี Data Integrity, Relations, และ Migration ประสิทธิภาพสูง |
| **Data Validation** | Zod | ตรวจสอบ Data Type และ Schema ทุก Request |
| **Automated Job** | node-cron | รันงาน Mark-absent ทุกคืนเวลา 00:05 น. (Asia/Bangkok) |
| **Testing Framework** | Jest + Supertest (Backend), Vitest (Frontend) | Integration Testing และ Unit Testing ครอบคลุม 86% Coverage |
| **DevOps & Infra** | Docker, Docker Compose, Nginx | Containerized Deployment พร้อม Nginx Reverse Proxy |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
attendance-system/
├── backend/                        # โค้ดส่วน Backend API (Node.js/Express)
│   ├── prisma/
│   │   ├── schema.prisma           # โครงสร้างฐานข้อมูล PostgreSQL
│   │   ├── migrations/             # ประวัติ SQL Database Migrations
│   │   └── seed.js                 # สคริปต์สร้างข้อมูลเริ่มต้น
│   ├── src/
│   │   ├── config/                 # ค่าคอนฟิก (Database, CORS, Swagger, Env)
│   │   ├── controllers/            # ตัวควบคุมการรับ-ส่ง HTTP Request & Response
│   │   ├── middlewares/            # Middleware (Auth, RBAC, RateLimit, WiFi, Validation)
│   │   ├── routes/                 # เส้นทาง API (Auth, Admin, Attendance, Leave, Reports)
│   │   ├── services/               # แกนหลัก Business Logic ของระบบ
│   │   ├── utils/                  # เครื่องมือช่วยเหลือ (Dates, JWT Token, Password, IP)
│   │   ├── jobs/                   # Background Cron Jobs (Mark Absent)
│   │   └── app.js                  # Entry Point ของ Express Server
│   ├── tests/                      # ชุด Integration Tests ทั้งหมด (Jest)
│   │   ├── helpers/                # Test utilities & DB cleaner
│   │   ├── admin.test.js           # ทดสอบ Admin CRUD & RBAC
│   │   ├── attendance.test.js      # ทดสอบ Check-in, Check-out, WiFi Whitelist
│   │   ├── auth.test.js            # ทดสอบ Login, Refresh, Logout, Change Password
│   │   ├── jobs.test.js            # ทดสอบ Cron Job & Idempotency
│   │   ├── leave.test.js           # ทดสอบ Leave Request, Balance & Approvals
│   │   └── reports.test.js         # ทดสอบ Dashboard Summary & Export Excel/CSV
│   ├── .env.example                # แม่แบบ Environment Variables Backend
│   ├── Dockerfile                  # Dockerfile สำหรับ Backend
│   └── package.json
│
├── frontend/                       # โค้ดส่วน Frontend Web App (React/Vite)
│   ├── src/
│   │   ├── components/             # Reusable UI Components (Navbar, Layout, Modal)
│   │   ├── pages/                  # หน้าแสดงผลแยกตาม Role
│   │   │   ├── admin/              # หน้าแอดมิน (Dashboard, Employees, Leaves, WiFi, etc.)
│   │   │   ├── employee/           # หน้าพนักงาน (Dashboard, Leave, History, Password)
│   │   │   └── LoginPage.jsx       # หน้าเข้าสู่ระบบ
│   │   ├── services/               # Axios API client & endpoints
│   │   ├── stores/                 # Zustand Stores (authStore)
│   │   ├── utils/                  # Date formatters & helpers
│   │   └── main.jsx
│   ├── .env.example                # แม่แบบ Environment Variables Frontend
│   ├── Dockerfile                  # Dockerfile สำหรับ Frontend
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── nginx/                          # Nginx Configuration สำหรับ Production
│   └── conf.d/default.conf
├── scripts/                        # สคริปต์จัดการระบบ (DevOps)
│   ├── backup.ps1                  # สคริปต์สำรองฐานข้อมูลบน Windows
│   ├── restore.ps1                 # สคริปต์กู้คืนฐานข้อมูลบน Windows
│   ├── backup.sh                   # สคริปต์สำรองฐานข้อมูลบน Linux/Docker
│   ├── restore.sh                  # สคริปต์กู้คืนฐานข้อมูลบน Linux/Docker
│   └── deploy.sh                   # สคริปต์ Auto Deploy สำหรับ Production
│
├── docker-compose.yml              # Docker Compose สำหรับ Development
├── docker-compose.prod.yml         # Docker Compose สำหรับ Production
├── Makefile                        # คำสั่งลัดสำหรับการพัฒนาและ Deploy
└── README.md                       # คู่มือการใช้งานฉบับสมบูรณ์
```

---

## 📋 ความต้องการของระบบ (Prerequisites)

ก่อนเริ่มติดตั้งระบบ กรุณาตรวจสอบว่าเครื่องของคุณมีซอฟต์แวร์ดังต่อไปนี้:
* **Node.js:** เวอร์ชั่น `>= 20.0.0` (แนะนำ LTS ล่าสุด)
* **PostgreSQL:** เวอร์ชั่น `15.0+` (หรือติดตั้งผ่าน Docker)
* **Git:** สำหรับโคลนและจัดการโค้ด
* **Docker Desktop:** *(ทางเลือก)* สำหรับผู้ที่ต้องการรันผ่าน Container

---

## 🚀 คู่มือการติดตั้งและเริ่มต้นใช้งาน (Installation & Quick Start)

### ขั้นตอนที่ 1: โคลน Repository
```bash
git clone https://github.com/your-username/attendance-system.git
cd attendance-system
```

---

### ขั้นตอนที่ 2: ตั้งค่า Environment Variables

#### 1. ฝั่ง Backend
```bash
cd backend
cp .env.example .env
```
สร้าง Random 64-char String สำหรับ JWT Secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
เปิดไฟล์ `backend/.env` และใส่ค่าคอนฟิก:
```env
DATABASE_URL=postgresql://attendance_user:attendance_pass@localhost:5432/attendance_db
JWT_ACCESS_SECRET=ใส่_random_string_ตัวที่1_ที่ได้จากคำสั่งด้านบน
JWT_REFRESH_SECRET=ใส่_random_string_ตัวที่2_ที่ได้จากคำสั่งด้านบน
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
TZ=Asia/Bangkok
CORS_ORIGIN=http://localhost:5173
```

#### 2. ฝั่ง Frontend
```bash
cd ../frontend
cp .env.example .env
```
ตรวจสอบไฟล์ `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=ระบบบันทึกเวลาทำงาน
```

---

### ขั้นตอนที่ 3: ติดตั้ง Dependencies และสร้าง Database

```bash
# 1. ติดตั้ง Backend Packages
cd ../backend
npm install

# 2. รัน Migration เพื่อสร้างตารางใน PostgreSQL
npx prisma migrate deploy

# 3. Seed ข้อมูลเริ่มต้น (แผนก, กะเวลา, บัญชีตัวอย่าง, วันหยุด)
npx prisma db seed

# 4. ติดตั้ง Frontend Packages
cd ../frontend
npm install
```

---

### ขั้นตอนที่ 4: เริ่มต้นรันเซิร์ฟเวอร์ (Development Mode)

เปิด 2 หน้าต่าง Terminal:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
```
* Backend API จะทำงานที่: `http://localhost:3000`
* Swagger Interactive API Docs: `http://localhost:3000/api/api-docs`

**Terminal 2 (Frontend React App):**
```bash
cd frontend
npm run dev
```
* เข้าใช้งาน Web App ได้ที่: `http://localhost:5173`

---

## 🔑 ข้อมูลบัญชีผู้ใช้ทดสอบ (Seed Accounts)

เมื่อรันคำสั่ง `npx prisma db seed` ระบบจะสร้างบัญชีเริ่มต้นสำหรับทดสอบระบบดังนี้:

| บทบาท (Role) | อีเมล (Email) / รหัสพนักงาน | รหัสผ่าน (Password) | แผนก | หมายเหตุ |
|---|---|---|---|---|
| 👑 **ADMIN** | `admin@company.com` / `ADM001` | `Admin@1234` | บุคคล (HR) | สิทธิ์เต็มทุกเมนู |
| 👤 **EMPLOYEE** | `somying@company.com` / `EMP001` | `Pass@1234` | ไอที (IT) | กะเช้า (09:00 - 18:00) |
| 👤 **EMPLOYEE** | `somsak@company.com` / `EMP002` | `Pass@1234` | ไอที (IT) | กะเช้า (09:00 - 18:00) |
| 👤 **EMPLOYEE** | `sompong@company.com` / `EMP003` | `Pass@1234` | การเงิน (Finance) | กะเช้า (09:00 - 18:00) |
| 👤 **EMPLOYEE** | `somporn@company.com` / `EMP004` | `Pass@1234` | ไอที (IT) | **กะดึก Night Shift (22:00 - 06:00)** |

*(⚠️ คำเตือน: กรุณาเปลี่ยนรหัสผ่านทันทีเมื่อนำขึ้นใช้งานบนสภาพแวดล้อม Production)*

---

## 📖 คู่มือการใช้งานอย่างละเอียด (User Manual)

### 1. สำหรับพนักงาน (Employee Guide)

```
[ เข้าสู่ระบบ ] ──► [ หน้าหลัก Dashboard ] ──► [ ตรวจสอบสถานะ WiFi บริษัท ]
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
[ บันทึกเวลาเข้า-ออกงาน ]             [ ยื่นใบลา / เช็คประวัติ ]
```

1. **การเข้าสู่ระบบ (Login):**
   - กรอก **อีเมล** หรือ **รหัสพนักงาน** (เช่น `EMP001`) และรหัสผ่าน
2. **การลงเวลาเข้างาน (Check-in):**
   - เข้าสู่หน้าหลัก Dashboard
   - สังเกตแถบด้านล่าง: จะต้องแสดงสถานะสีเขียว **"เชื่อมต่อเครือข่ายบริษัทแล้ว"** (หากอยู่นอกเครือข่ายจะไม่สามารถกดเช็คอินได้)
   - กดปุ่ม **"บันทึกเวลาเข้างาน"** สีน้ำเงิน -> ระบบจะบันทึกเวลาเข้างานจริง และคำนวณสถานะ (ปกติ หรือ สาย) ทันที
3. **การลงเวลาออกงาน (Check-out):**
   - เมื่อหมดเวลาทำงาน ให้กดปุ่ม **"บันทึกเวลาออกงาน"** สีส้ม -> ระบบจะคำนวณชั่วโมงทำงานสุทธิของวันนั้นให้โดยอัตโนมัติ
4. **การยื่นคำขอลางาน (Leave Requests):**
   - ไปที่เมนู **"ยื่นใบลา"** ในแถบด้านซ้าย
   - ดูยอดวันลาคงเหลือ 3 การ์ดด้านบน (ลาป่วย 30 วัน, ลากิจ 6 วัน, ลาพักร้อน 6 วัน)
   - เลือกประเภทการลา, ระบุวันที่เริ่มต้น - สิ้นสุด (หรือติ๊ก "ลาครึ่งวัน"), และพิมพ์เหตุผลประกอบ
   - กดปุ่ม **"ส่งคำขอลางาน"** (ระบบจะคำนวณหักเฉพาะวันทำงาน โดยไม่นับเสาร์-อาทิตย์และวันหยุดนักขัตฤกษ์)
5. **การตรวจสอบประวัติย้อนหลัง (History):**
   - ไปที่เมนู **"ประวัติการลงเวลา"** เพื่อดูตารางบันทึกเวลาเข้า-ออก และสรุปชั่วโมงทำงานรวมรายเดือน

---

### 2. สำหรับผู้ดูแลระบบ (Admin Guide)

1. **หน้าสรุปภาพรวม (Admin Dashboard):**
   - แสดงตัวเลขแบบ Real-time: จำนวนพนักงานทั้งหมด, มาปกติ, มาสาย, ลางาน, ขาดงาน, และพนักงานที่ยังไม่ลงเวลา
2. **การอนุมัติคำขอลางาน (Leave Approvals):**
   - ไปที่เมนู **"อนุมัติการลา"**
   - ตรวจสอบรายการใบลาที่ขึ้นสถานะ `รออนุมัติ (PENDING)`
   - กด **"อนุมัติ"** -> ระบบจะตัดยอดวันลาของพนักงาน และสร้างประวัติการทำงานเป็น `ON_LEAVE` อัตโนมัติ
   - หรือกด **"ปฏิเสธ"** -> กรอกเหตุผลการปฏิเสธเพื่อให้พนักงานรับทราบ
3. **การจัดการพนักงาน (Employee Management):**
   - ไปที่เมนู **"จัดการพนักงาน"**
   - สามารถกด **"เพิ่มพนักงานใหม่"** (ระบบจะสร้างโควตาวันลาปีปัจจุบันให้อัตโนมัติ 3 ประเภท)
   - สามารถแก้ไขข้อมูล, เปลี่ยนแผนก/กะเวลา, หรือปิดการใช้งาน (Soft Delete)
4. **การจัดการกะเวลาและแผนก (Master Data):**
   - **กะเวลาทำงาน:** กำหนดเวลาเริ่ม-เลิกงาน, ผ่อนปรนสายกี่นาที, และเปิดโหมดกะดึก (Night Shift)
   - **จัดการแผนก:** เพิ่มหรือแก้ไขชื่อแผนกในองค์กร
   - **จัดการวันหยุด:** เพิ่มปฏิทินวันหยุดประจำปีของบริษัท
5. **การจัดการ WiFi IP Whitelist:**
   - ไปที่เมนู **"จัดการ WiFi"**
   - กด **"เพิ่ม IP ที่อนุญาต"** และใส่ Public IP หรือ Gateway IP ของสำนักงาน
6. **การออกรายงาน (Export Reports):**
   - ไปที่เมนู **"รายงาน"**
   - เลือกเดือน, ปี, และแผนกที่ต้องการ
   - กดปุ่ม **"ส่งออก Excel (.xlsx)"** หรือ **"ส่งออก CSV (.csv)"** ได้ทันที

---

## ⏰ ระบบประมวลผลอัตโนมัติ (Automated Cron Job)

ระบบมี Background Worker (`backend/src/jobs/markAbsent.js`) ที่ทำงานอัตโนมัติทุกวันเวลา **00:05 น. (เวลาประเทศไทย)** โดยมี Logic การตรวจสอบดังนี้:

```text
[ เริ่มทำงาน 00:05 น. ]
         │
         ├──► วันนี้เป็นวันเสาร์หรืออาทิตย์? ──(ใช่)──► [ ข้ามการทำงาน (Skip) ]
         │
         ├──► วันนี้เป็นวันหยุดนักขัตฤกษ์ในระบบ? ──(ใช่)──► [ ข้ามการทำงาน (Skip) ]
         │
         └──► วนลูปตรวจสอบพนักงานทุกคนที่ Active:
                 ├── มีประวัติลงเวลาแล้ว? ──(ใช่)──► [ ข้าม ]
                 ├── มีใบลาที่อนุมัติแล้ว? ──(ใช่)──► [ ข้าม ]
                 └── ไม่มีประวัติใดๆ ──► [ บันทึกสถานะเป็น ABSENT (ขาดงาน) ]
```

---

## 💾 การสำรองและกู้คืนฐานข้อมูล (Backup & Restore)

### 🪟 สำหรับระบบปฏิบัติการ Windows (PowerShell)

**1. คำสั่งสำรองฐานข้อมูล (Backup):**
```powershell
powershell -ExecutionPolicy Bypass -File "scripts/backup.ps1"
```
*(ไฟล์ `.sql` จะถูกบันทึกในโฟลเดอร์ `backups/` และระบบจะลบไฟล์เก่าเกิน 30 วันให้อัตโนมัติ)*

**2. คำสั่งกู้คืนฐานข้อมูล (Restore):**
```powershell
powershell -ExecutionPolicy Bypass -File "scripts/restore.ps1" -BackupFile "backups/backup_attendance_db_xxxx.sql"
```

---

### 🐧 สำหรับระบบปฏิบัติการ Linux / Docker (Bash)

**1. คำสั่งสำรองฐานข้อมูล (Backup):**
```bash
chmod +x scripts/*.sh
./scripts/backup.sh
```

**2. คำสั่งกู้คืนฐานข้อมูล (Restore):**
```bash
./scripts/restore.sh backups/backup_attendance_db_xxxx.sql.gz
```

> 💡 **แนะนำการตั้งเวลาสำรองข้อมูลอัตโนมัติบน Linux (Cron):**
> เปิด crontab ด้วยคำสั่ง `crontab -e` และเพิ่มบรรทัดนี้เพื่อสำรองข้อมูลทุกคืนเวลาตี 1:
> ```cron
> 0 1 * * * /bin/bash /path/to/attendance-system/scripts/backup.sh >> /var/log/attendance_backup.log 2>&1
> ```

---

## 🧪 การทดสอบและผล Code Coverage (Testing & QA)

ระบบมีการเขียน **Automated Integration Test Suites ครบทุก Endpoint และทุก Service** โดยสามารถรันชุดทดสอบได้ด้วยคำสั่ง:

```bash
# รัน Backend Tests ทั้งหมด (72 Tests) พร้อมดูตาราง Coverage
cd backend
npm run test:coverage

# รัน Frontend Unit Tests (3 Tests)
cd ../frontend
npm test

# ตรวจสอบการ Build Frontend สำหรับ Production
npm run build
```

---

## 🚢 การนำขึ้นใช้งานจริงบน Production (Production Deployment)

ระบบถูกจัดเตรียมไฟล์ `docker-compose.prod.yml` และ Nginx Configuration ไว้พร้อมสำหรับการ Deploy บน Cloud VM (เช่น Ubuntu 22.04 / 24.04 บน AWS, DigitalOcean, GCP หรือ On-Premise Server)

### ขั้นตอนการ Deploy ด้วย Docker Compose:

1. **เตรียม Server และติดตั้ง Docker:**
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-plugin
   ```
2. **โคลนโค้ดและตั้งค่า `.env` สำหรับ Production:**
   ```bash
   git clone https://github.com/your-username/attendance-system.git
   cd attendance-system
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # แก้ไขรหัสผ่าน DB และ JWT Secrets ให้ปลอดภัย
   ```
3. **กำหนดชื่อ Domain ใน Nginx:**
   เปิดไฟล์ `nginx/conf.d/default.conf` และระบุ Domain Name ขององค์กร
4. **สั่ง Build และรันระบบทั้งหมด:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
   ```

---

## ❓ การแก้ไขปัญหาที่พบบ่อย (Troubleshooting & FAQ)

#### Q1: กดปุ่ม "บันทึกเวลาเข้างาน" ไม่ได้ หรือขึ้นเตือน "ไม่ได้เชื่อมต่อ WiFi บริษัท"
* **สาเหตุ:** IP Address ของเครื่องที่เข้าใช้งานไม่อยู่ในตาราง `CompanyWifiWhitelist`
* **วิธีแก้:** เข้าสู่ระบบด้วยบัญชี Admin -> ไปที่เมนู **"จัดการ WiFi"** -> เพิ่ม IP ที่ใช้งานอยู่ (สามารถดู IP ปัจจุบันได้จากข้อความแจ้งเตือนสีส้มบนหน้า Dashboard)

#### Q2: ล็อกอินไม่ผ่าน แจ้งเตือน Invalid Credentials
* **สาเหตุ:** รหัสผ่านผิด หรือฐานข้อมูลยังไม่ได้รัน Seed
* **วิธีแก้:** รันคำสั่ง `npx prisma db seed` ในโฟลเดอร์ `backend` เพื่อรีเซ็ตรหัสผ่านเริ่มต้นเป็น `Admin@1234` หรือ `Pass@1234`

#### Q3: พนักงานกะกลางคืน (Night Shift) เช็คอินหลังเที่ยงคืนแล้ววันทำงานผิด
* **วิธีแก้:** ระบบมีฟังก์ชัน `getWorkDate()` ที่จะผูกกะดึกเข้ากับวันเริ่มต้นกะทำงานโดยอัตโนมัติ กรุณาตรวจสอบว่ากะเวลานั้นได้เปิดตัวเลือก `isNightShift = true` แล้วในเมนูกะการทำงาน

---

## 📄 สัญญาอนุญาต (License)

โปรเจกต์นี้เผยแพร่ภายใต้สัญญาอนุญาต **[MIT License](LICENSE)**  
สามารถนำไปพัฒนาต่อยอด ใช้งานภายในองค์กร หรือใช้งานในเชิงพาณิชย์ได้อย่างเสรี

---

**Developed with ❤️ for Modern Workforce Management**  
*หากพบปัญหาหรือมีข้อเสนอแนะ สามารถเปิด Issue หรือส่ง Pull Request เข้ามาได้เลยครับ!*
