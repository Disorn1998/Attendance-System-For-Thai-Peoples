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
2. [ภาพหน้าจอการทำงานจริง & คำอธิบายแต่ละส่วน (Real UI Screenshots & Walkthrough)](#-ภาพหน้าจอการทำงานจริง--คำอธิบายแต่ละส่วน-real-ui-screenshots--walkthrough)
   - [2.1 หน้าลงชื่อเข้าใช้งาน (Login & Authentication)](#21-หน้าลงชื่อเข้าใช้งาน-login--authentication)
   - [2.2 แดชบอร์ดพนักงานและการลงเวลาเรียลไทม์ (Employee Dashboard & Clock-in)](#22-แดชบอร์ดพนักงานและการลงเวลาเรียลไทม์-employee-dashboard--clock-in)
   - [2.3 ระบบการลางานและเช็คโควตาคงเหลือ (Leave Management Portal)](#23-ระบบการลางานและเช็คโควตาคงเหลือ-leave-management-portal)
   - [2.4 ประวัติการลงเวลาและสถิติรายเดือน (Attendance History)](#24-ประวัติการลงเวลาและสถิติรายเดือน-attendance-history)
   - [2.5 แดชบอร์ดสรุปภาพรวมสำหรับผู้บริหาร/HR (Admin KPI Dashboard)](#25-แดชบอร์ดสรุปภาพรวมสำหรับผู้บริหารhr-admin-kpi-dashboard)
   - [2.6 การอนุมัติคำขอลางาน (Leave Requests Approval Workflow)](#26-การอนุมัติคำขอลางาน-leave-requests-approval-workflow)
   - [2.7 การจัดการข้อมูลบุคลากรและ PDPA (Employee Management)](#27-การจัดการข้อมูลบุคลากรและ-pdpa-employee-management)
   - [2.8 การจัดการกะเวลาทำงานและกะดึก (Work Shifts & Night Shift)](#28-การจัดการกะเวลาทำงานและกะดึก-work-shifts--night-shift)
   - [2.9 การจัดการโครงสร้างแผนกงาน (Departments Management)](#29-การจัดการโครงสร้างแผนกงาน-departments-management)
   - [2.10 การควบคุมความปลอดภัยเครือข่าย (WiFi IP Whitelist Enforcement)](#210-การควบคุมความปลอดภัยเครือข่าย-wifi-ip-whitelist-enforcement)
   - [2.11 ระบบรายงานและการส่งออกข้อมูล (Monthly Reports & Excel/CSV Export)](#211-ระบบรายงานและการส่งออกข้อมูล-monthly-reports--excelcsv-export)
3. [เทคโนโลยีและสถาปัตยกรรม (Tech Stack & Architecture)](#-เทคโนโลยีและสถาปัตยกรรม-tech-stack--architecture)
4. [โครงสร้างโปรเจกต์ (Project Structure)](#-โครงสร้างโปรเจกต์-project-structure)
5. [ความต้องการของระบบ (Prerequisites)](#-ความต้องการของระบบ-prerequisites)
6. [คู่มือการติดตั้งและเริ่มต้นใช้งาน (Installation & Quick Start)](#-คู่มือการติดตั้งและเริ่มต้นใช้งาน-installation--quick-start)
7. [การตั้งค่า Environment Variables (.env)](#-การตั้งค่า-environment-variables-env)
8. [ข้อมูลบัญชีผู้ใช้ทดสอบ (Seed Accounts)](#-ข้อมูลบัญชีผู้ใช้ทดสอบ-seed-accounts)
9. [ระบบประมวลผลอัตโนมัติ (Automated Cron Job)](#-ระบบประมวลผลอัตโนมัติ-automated-cron-job)
10. [การสำรองและกู้คืนฐานข้อมูล (Backup & Restore)](#-การสำรองและกู้คืนฐานข้อมูล-backup--restore)
11. [การทดสอบและผล Code Coverage (Testing & QA)](#-การทดสอบและผล-code-coverage-testing--qa)
12. [การนำขึ้นใช้งานจริงบน Production (Production Deployment)](#-การนำขึ้นใช้งานจริงบน-production-production-deployment)
13. [การแก้ไขปัญหาที่พบบ่อย (Troubleshooting & FAQ)](#-การแก้ไขปัญหาที่พบบ่อย-troubleshooting--faq)
14. [สัญญาอนุญาต (License)](#-สัญญาอนุญาต-license)

---

## 🎯 ภาพรวมของระบบ (Overview)

**Employee Attendance System** คือระบบจัดการและบันทึกเวลาการทำงานของพนักงานระดับ Enterprise ออกแบบมาเพื่อตอบโจทย์องค์กรทุกขนาดตั้งแต่ Startups จนถึงบริษัทขนาดใหญ่ (200 - 500+ คน) ที่ต้องการความถูกต้องแม่นยำสูง ปลอดภัย และใช้งานง่าย

ตัวระบบทำงานแบบ **Real-time**, บังคับตรวจสอบความปลอดภัยเครือข่าย (**WiFi IP Whitelist Enforcement**), รองรับกะเวลาหลากหลายรูปแบบรวมถึงกะข้ามคืน (**Night Shift**), คำนวณวันลาที่คำนึงถึงวันหยุดนักขัตฤกษ์ (**Holiday-Aware Leave Management**), และมีระบบออกรายงานสรุปประจำเดือนส่งออกเป็นไฟล์ **Excel (.xlsx)** และ **CSV (UTF-8 with BOM)** ภาษาไทยสมบูรณ์แบบ

---

## 📸 ภาพหน้าจอการทำงานจริง & คำอธิบายแต่ละส่วน (Real UI Screenshots & Walkthrough)

*(ภาพหน้าจอทั้งหมดถูกจับภาพโดยตรงจากระบบที่กำลังรันจริงในความละเอียดระดับ Retina Display)*

### 2.1 หน้าลงชื่อเข้าใช้งาน (Login & Authentication)

![01 Login Page](docs/screenshots/01_login_page.png)

#### 🌟 จุดเด่นและการทำงานในหน้านี้:
* **Modern Minimalist UI:** ดีไซน์สไตล์มินิมอล พื้นหลังสีเข้มเน้นการโฟกัสการใช้งาน สบายตา
* **Dual Login Support:** รองรับการเข้าสู่ระบบได้ทั้งด้วย **อีเมลองค์กร** (เช่น `somying@company.com`) หรือ **รหัสประจำตัวพนักงาน** (เช่น `EMP001`)
* **Quick Demo Account Selector:** ด้านล่างมีปุ่มสลับบัญชีทดสอบด่วน (ผู้ดูแลระบบ และ พนักงาน) เพียงคลิกเดียว ข้อมูลจะถูกกรอกให้อัตโนมัติ เพิ่มความสะดวกในการทดสอบระบบ
* **Security & Rate Limiting:** เข้ารหัสรหัสผ่านด้วย `bcryptjs` (Cost factor: 12) พร้อมติดตั้ง Express Rate Limit ป้องกันการสุ่มรหัสผ่าน (Brute-Force Attack)

---

### 2.2 แดชบอร์ดพนักงานและการลงเวลาเรียลไทม์ (Employee Dashboard & Clock-in)

![02 Employee Dashboard](docs/screenshots/02_employee_dashboard.png)

#### 🌟 จุดเด่นและการทำงานในหน้านี้:
* **Digital Live Clock:** นาฬิกาดิจิทัลแสดงเวลาปัจจุบันแบบ Real-time ตาม Timezone ประเทศไทย (`Asia/Bangkok` GMT+7)
* **Smart Action Buttons:** ปุ่มกดบันทึกเวลาเข้างาน (สีน้ำเงิน) และบันทึกเวลาออกงาน (สีส้ม) มีสถานะชัดเจน (เมื่อเช็คอินแล้ว ปุ่มจะเปลี่ยนเป็นสถานะ *เช็คอินเรียบร้อย* และเปิดให้กดบันทึกเวลาออกงาน)
* **Real-time WiFi Whitelist Badge:** แถบสีเขียวแสดงสถานะการเชื่อมต่อเครือข่ายบริษัทพร้อม IP Address ปัจจุบัน ป้องกันการลงเวลาจากภายนอกออฟฟิศ
* **Today's Attendance Status:** การ์ดสรุปเวลาเข้างานจริง, เวลาออกงาน, ชั่วโมงทำงานสะสม, และสถานะการมาทำงาน (เช่น เข้างานปกติ หรือ เข้างานสาย)
* **Work Shift Details:** แสดงข้อมูลกะการทำงานของพนักงาน, ช่วงเวลาปฏิบัติงาน และเกณฑ์การผ่อนปรนเวลาเข้าสาย (Grace Period เช่น ไม่เกิน 15 นาที)

---

### 2.3 ระบบการลางานและเช็คโควตาคงเหลือ (Leave Management Portal)

![03 Employee Leave Portal](docs/screenshots/03_employee_leave.png)

#### 🌟 จุดเด่นและการทำงานในหน้านี้:
* **Leave Quota Cards:** การ์ดแสดงโควตาสิทธิวันลา 3 รูปแบบหลัก ได้แก่ **ลาป่วย (Sick Leave)**, **ลากิจ (Personal Leave)**, และ **ลาพักร้อน (Annual Leave)**
* **Visual Progress Indicators:** แถบเปอร์เซ็นต์และตัวเลขบอกวันคงเหลือ vs วันที่ใช้ไปอย่างชัดเจน
* **Online Leave Application:** ปุ่ม `+ ยื่นคำขอลางาน` เปิดหน้าต่าง Modal สำหรับส่งใบลาออนไลน์ รองรับทั้งการลาเต็มวันและการลาครึ่งวัน (Half-day)
* **Holiday & Weekend Aware:** ระบบคำนวณวันลาสุทธิโดยข้ามวันเสาร์-อาทิตย์ และวันหยุดนักขัตฤกษ์ของบริษัทให้อัตโนมัติ
* **Leave Request History Table:** ตารางติดตามสถานะใบลาแบบเรียลไทม์ (รอพิจารณา, อนุมัติแล้ว, หรือไม่อนุมัติ) พร้อมแสดงเหตุผลที่ยื่น

---

### 2.4 ประวัติการลงเวลาและสถิติรายเดือน (Attendance History)

![04 Employee Attendance History](docs/screenshots/04_employee_history.png)

#### 🌟 จุดเด่นและการทำงานในหน้านี้:
* **Monthly Metric Highlights:** แผงสถิติสรุปภาพรวมประจำเดือน ได้แก่ จำนวนวันทำงานทั้งหมด, จำนวนครั้งที่เข้างานสาย, จำนวนวันขาดงาน, จำนวนวันลา, และชั่วโมงการทำงานสะสมรวม
* **Month & Year Filter:** เมนูดร็อปดาวน์เลือกดูข้อมูลย้อนหลังตามเดือนและปี (พ.ศ. / ค.ศ.)
* **Detailed Daily Log:** ตารางแจกแจงบันทึกเวลารายวัน แสดงวันที่, วันในสัปดาห์, เวลาเข้างาน, เวลาออกงาน, รวมชั่วโมงทำงาน, และ Badge สถานะสีสดใสกำกับชัดเจน (มาทำงาน, สาย, ลางาน, ขาดงาน)

---

### 2.5 แดชบอร์ดสรุปภาพรวมสำหรับผู้บริหาร/HR (Admin KPI Dashboard)

![05 Admin Dashboard](docs/screenshots/05_admin_dashboard.png)

#### 🌟 จุดเด่นและการทำงานในหน้านี้:
* **Real-time KPI Metrics (4 การ์ดหลัก):**
  1. **มาทำงานปกติ (Present):** แสดงจำนวนและเปอร์เซ็นต์ของพนักงานที่มาทำงานตรงเวลา
  2. **เข้างานสาย (Late):** แสดงจำนวนพนักงานที่เข้างานเกินเวลาผ่อนปรน
  3. **ลางาน (On Leave):** สรุปจำนวนพนักงานที่ได้รับอนุมัติการลาในวันนี้ (ป่วย/กิจ/พักร้อน)
  4. **ขาดงาน / รอเช็คอิน (Absent / Pending):** แสดงจำนวนพนักงานที่ยังไม่ลงเวลา
* **Automated Cron Job Indicator:** แถบแสดงสถานะระบบตรวจจับการขาดงานอัตโนมัติ (Automated Absent Cron Job) ขึ้นสถานะ **ACTIVE** สีเขียว พร้อมระบุเวลาทำงานอัตโนมัติ (00:05 น. ทุกวัน)
* **Quick Management Shortcuts:** ทางลัดเข้าสู่เมนูจัดการพนักงาน, จัดการกะเวลา, อนุมัติการลา, และ WiFi Whitelist ได้ในคลิกเดียว

---

### 2.6 การอนุมัติคำขอลางาน (Leave Requests Approval Workflow)

![06 Admin Leave Requests](docs/screenshots/06_admin_leave_requests.png)

#### 🌟 จุดเด่นและการทำงานในหน้านี้:
* **Status Filter Tabs:** แถบกรองสถานะใบลา 4 แท็บ: `รอพิจารณา`, `อนุมัติแล้ว`, `ไม่อนุมัติ`, และ `ทั้งหมด`
* **Comprehensive Request Info:** แสดงข้อมูลพนักงาน (ชื่อ, รหัส, แผนก), ประเภทการลา, ช่วงวันที่ลา, จำนวนวันสุทธิ, และเหตุผลประกอบการลา
* **One-Click Approval:** ปุ่มกด **"อนุมัติ"** (ระบบจะตัดยอดโควตาวันลาและสร้างข้อมูลบันทึกเวลาเป็น `ON_LEAVE` ให้อัตโนมัติ)
* **Rejection Reason Modal:** ปุ่มกด **"ปฏิเสธ"** พร้อมหน้าต่างให้ระบุเหตุผลเพื่อแจ้งกลับไปยังพนักงาน

---

### 2.7 การจัดการข้อมูลบุคลากรและ PDPA (Employee Management)

![07 Admin Employee Management](docs/screenshots/07_admin_employees.png)

#### 🌟 จุดเด่นและการทำงานในหน้านี้:
* **Central Employee Directory:** รายชื่อพนักงานทั้งหมดในองค์กร พร้อมข้อมูล แผนก ตำแหน่ง กะเวลาทำงาน และสิทธิ์การเข้าใช้งาน
* **Smart Filter & Instant Search:** ค้นหาพนักงานได้ทันทีตามชื่อ, รหัสพนักงาน, หรืออีเมล พร้อมฟิลเตอร์กรองตามแผนกและบทบาท (Admin / Employee)
* **Automated Leave Balance Provisioning:** เมื่อกดปุ่ม `+ เพิ่มพนักงานใหม่` ระบบจะสร้างโควตาวันลาปีปัจจุบันให้โดยอัตโนมัติทันที
* **PDPA Compliant Soft-Delete:** รองรับการแก้ไขข้อมูลและระงับการใช้งานพนักงาน (Soft-delete) ไม่ทำลายข้อมูลประวัติการลงเวลาย้อนหลัง

---

### 2.8 การจัดการกะเวลาทำงานและกะดึก (Work Shifts & Night Shift)

![08 Admin Work Shifts](docs/screenshots/08_admin_work_shifts.png)

#### 🌟 จุดเด่นและการทำงานในหน้านี้:
* **Flexible Work Shift Schemes:** รองรับทั้งกะปกติเวลากลางวัน (Day Shift เช่น 09:00 - 18:00) และกะข้ามคืน (**Night Shift** เช่น 22:00 - 06:00)
* **Configurable Late Grace Period:** กำหนดระยะเวลาผ่อนปรนการเข้าสายเป็นรายกะได้ (เช่น ผ่อนปรน 15 นาที)
* **Intelligent Night Shift Logic:** อัลกอริทึม `getWorkDate()` ผูกการลงเวลาของกะดึกหลังเที่ยงคืนเข้ากับวันเริ่มกะอย่างถูกต้อง 100%

---

### 2.9 การจัดการโครงสร้างแผนกงาน (Departments Management)

![09 Admin Departments](docs/screenshots/09_admin_departments.png)

#### 🌟 จุดเด่นและการทำงานในหน้านี้:
* **Organization Hierarchy:** จัดการโครงสร้างแผนกงานภายในบริษัท (ฝ่ายไอที, ฝ่ายการเงิน, ฝ่ายบุคคล ฯลฯ)
* **Department Headcount Badge:** แสดงตัวเลขจำนวนบุคลากรที่สังกัดในแต่ละแผนกแบบ Real-time
* **Safety Verification:** ป้องกันการลบแผนกที่มีพนักงานสังกัดอยู่ เพื่อรักษาความสมบูรณ์ของโครงสร้างข้อมูล (Foreign Key Integrity)

---

### 2.10 การควบคุมความปลอดภัยเครือข่าย (WiFi IP Whitelist Enforcement)

![10 Admin WiFi Whitelist](docs/screenshots/10_admin_wifi_whitelist.png)

#### 🌟 จุดเด่นและการทำงานในหน้านี้:
* **Network Access Control:** กำหนดรายการ IP Address ของเราเตอร์หรือเกตเวย์ออฟฟิศที่อนุญาตให้พนักงานลงเวลาเข้า-ออกงาน
* **Quick Add & Helper Tool:** มีคำแนะนำและปุ่มกดคัดลอก IP ได้สะดวกรวดเร็ว
* **Multi-office & Branch Support:** รองรับการเพิ่มหลาย IP Address สำหรับองค์กรที่มีหลายสาขาหรือสำนักงานย่อย

---

### 2.11 ระบบรายงานและการส่งออกข้อมูล (Monthly Reports & Excel/CSV Export)

![11 Admin Monthly Reports](docs/screenshots/11_admin_reports.png)

#### 🌟 จุดเด่นและการทำงานในหน้านี้:
* **Monthly Organization Summary:** การ์ดสรุปผลรวมทั้งบริษัทประจำเดือน (วันทำงานปกติสะสม, ครั้งที่มาสายรวม, วันที่ลา, วันที่ขาดงาน, และชั่วโมงการทำงานสะสมรวม)
* **Employee Attendance Table:** ตารางแสดงสถิติแจกแจงรายบุคคลอย่างละเอียด
* **Dual Format Export:**
  * **📗 ส่งออก Excel (.xlsx):** จัดรูปแบบหัวตาราง สีกำกับ และความกว้างคอลัมน์อัตโนมัติ
  * **📄 ส่งออก CSV (.csv):** เข้ารหัส UTF-8 พร้อม **Byte Order Mark (BOM)** เปิดใน Microsoft Excel ภาษาไทยไม่เป็นภาษาต่างดาว

---

## 🛠️ เทคโนโลยีและสถาปัตยกรรม (Tech Stack & Architecture)

```text
┌────────────────────────────────────────────────────────┐
│        Frontend: React 18 + Vite + Tailwind CSS        │
│          (Single Page Application / Zustand State)     │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON REST API
                            │ (httpOnly JWT Cookies)
┌───────────────────────────▼────────────────────────────┐
│         Nginx Reverse Proxy & SSL Termination          │
└───────────────────────────┬────────────────────────────┘
                            │ Port 3000 / 3005
┌───────────────────────────▼────────────────────────────┐
│          Backend: Node.js + Express.js (ESM)           │
│  ├── JWT Auth & In-Memory Token Blacklist Store        │
│  ├── Business Logic & Zod Schema Validation            │
│  ├── Background Cron Job (node-cron @ 00:05 AM)        │
│  └── Prisma ORM Client (Data Layer)                    │
└───────────────────────────┬────────────────────────────┘
                            │ PostgreSQL Connection Pool
┌───────────────────────────▼────────────────────────────┐
│         PostgreSQL Database (ACID Compliant)           │
└────────────────────────────────────────────────────────┘
```

| ชั้นสถาปัตยกรรม (Layer) | เทคโนโลยีที่ใช้ | วัตถุประสงค์และจุดเด่น |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | SPA โหลดเร็ว Build ใช้เวลาเพียง 1.3 วินาที |
| **Styling & Icons** | Tailwind CSS + Lucide Icons | Responsive Design เต็มรูปแบบ รองรับ Mobile, Tablet, PC |
| **State Management** | Zustand | จัดการ Authentication State และ User Context เบาและเสถียร |
| **HTTP Client** | Axios | มี Interceptors จัดการ Auto Refresh Token อัตโนมัติ |
| **Backend Framework** | Node.js (v20+) + Express.js | สถาปัตยกรรม Service-Controller แยก Logic ชัดเจน |
| **Database & ORM** | PostgreSQL 15+ & Prisma ORM | การันตี Data Integrity, Migration รวดเร็ว แม่นยำ |
| **Validation** | Zod | ตรวจสอบ Schema ของ Request Data ทุกจุด |
| **Cron Jobs** | node-cron | รันงานตรวจจับการขาดงานอัตโนมัติทุกคืนเวลา 00:05 น. |
| **Testing** | Jest + Supertest (Backend), Vitest (Frontend) | ชุด Integration Tests ครอบคลุม 86.34% Code Coverage |
| **DevOps & Infra** | Docker, Docker Compose, Nginx | Containerized พร้อม Deploy ทุกสภาพแวดล้อม |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
attendance-system/
├── backend/                        # ส่วน Backend API (Node.js/Express)
│   ├── prisma/
│   │   ├── schema.prisma           # โครงสร้างฐานข้อมูล PostgreSQL
│   │   ├── migrations/             # ประวัติ SQL Migrations
│   │   └── seed.js                 # สคริปต์สร้างข้อมูลจำลองตั้งต้น
│   ├── src/
│   │   ├── config/                 # การตั้งค่า (DB, CORS, Swagger, Env)
│   │   ├── controllers/            # ตัวควบคุม Request & Response
│   │   ├── middlewares/            # Middlewares (Auth, RBAC, RateLimit, WiFi, Validation)
│   │   ├── routes/                 # เส้นทาง API (Auth, Admin, Attendance, Leave, Reports)
│   │   ├── services/               # แกนหลัก Business Logic ของระบบ
│   │   ├── utils/                  # เครื่องมือช่วยเหลือ (Dates, Token, Password, IP)
│   │   ├── jobs/                   # Background Cron Jobs (Mark Absent)
│   │   └── app.js                  # Entry Point ของ Express Server
│   ├── tests/                      # ชุด Integration Tests ทั้งหมด (Jest)
│   │   ├── admin.test.js           # ทดสอบ Admin CRUD & Master Data
│   │   ├── attendance.test.js      # ทดสอบ Check-in, Check-out, WiFi Whitelist
│   │   ├── auth.test.js            # ทดสอบ Login, Refresh Token, Logout
│   │   ├── jobs.test.js            # ทดสอบ Automated Cron Job
│   │   ├── leave.test.js           # ทดสอบ Leave Request, Balances & Approvals
│   │   └── reports.test.js         # ทดสอบ KPI Dashboard & Excel/CSV Export
│   ├── .env.example                # แม่แบบ Environment Variables Backend
│   └── package.json
│
├── frontend/                       # ส่วน Frontend Web App (React/Vite)
│   ├── src/
│   │   ├── components/             # Reusable UI Components (Navbar, Layout, Modal)
│   │   ├── pages/                  # หน้าแสดงผลแยกตาม Role
│   │   │   ├── admin/              # หน้าสำหรับผู้ดูแลระบบ (Dashboard, Employees, Leaves, etc.)
│   │   │   ├── employee/           # หน้าสำหรับพนักงาน (Dashboard, Leave, History, Password)
│   │   │   └── LoginPage.jsx       # หน้าเข้าสู่ระบบ
│   │   ├── services/               # Axios API client & Endpoints
│   │   ├── stores/                 # Zustand Stores (authStore)
│   │   ├── utils/                  # Date Formatters & Helpers
│   │   └── main.jsx
│   ├── .env.example                # แม่แบบ Environment Variables Frontend
│   └── package.json
│
├── docs/                           # เอกสารประกอบและรูปภาพระบบ
│   └── screenshots/                # รูปภาพหน้าจอจริงของระบบ (Retina 2x Resolution)
├── nginx/                          # Nginx Configuration สำหรับ Production Reverse Proxy
├── scripts/                        # สคริปต์จัดการระบบและ Backup DB (Windows/Linux)
│   ├── backup.ps1 / restore.ps1    # สคริปต์ Backup/Restore สำหรับ Windows
│   └── backup.sh / restore.sh      # สคริปต์ Backup/Restore สำหรับ Linux/Docker
├── docker-compose.yml              # Docker Compose สำหรับ Local Development
├── docker-compose.prod.yml         # Docker Compose สำหรับ Production
├── Makefile                        # คำสั่งลัดสำหรับการพัฒนาและ Deploy
└── README.md                       # เอกสารคู่มือฉบับนี้
```

---

## 📋 ความต้องการของระบบ (Prerequisites)

* **Node.js:** เวอร์ชั่น `>= 20.0.0` (แนะนำ LTS ล่าสุด)
* **PostgreSQL:** เวอร์ชั่น `15.0+` (หรือรันผ่าน Docker)
* **Git:** สำหรับโคลนและจัดการโค้ด
* **Docker & Docker Compose:** *(ทางเลือก)* สำหรับการรันด้วย Container

---

## 🚀 คู่มือการติดตั้งและเริ่มต้นใช้งาน (Installation & Quick Start)

### 1. โคลน Repository
```bash
git clone https://github.com/Disorn1998/Attendance-System-For-Thai-Peoples.git
cd Attendance-System-For-Thai-Peoples
```

---

### 2. ตั้งค่า Environment Variables

#### 2.1 ฝั่ง Backend
```bash
cd backend
cp .env.example .env
```
สร้าง Random 64-char String สำหรับ JWT Secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
เปิดไฟล์ `backend/.env` และตั้งค่า:
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

#### 2.2 ฝั่ง Frontend
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

### 3. ติดตั้ง Dependencies และ Migrations

```bash
# 1. ติดตั้ง Backend Packages
cd ../backend
npm install

# 2. รัน Migration เพื่อสร้างตารางใน PostgreSQL
npx prisma migrate deploy

# 3. Seed ข้อมูลเริ่มต้น (แผนก, กะเวลา, บัญชีพนักงานตัวอย่าง, วันหยุด)
npx prisma db seed

# 4. ติดตั้ง Frontend Packages
cd ../frontend
npm install
```

---

### 4. รันระบบในโหมดพัฒนา (Development Mode)

เปิด 2 Terminal:

**Terminal 1 (Backend API Server):**
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

| บทบาท (Role) | อีเมล (Email) / รหัสพนักงาน | รหัสผ่าน (Password) | แผนก | หมายเหตุ |
|---|---|---|---|---|
| 👑 **ADMIN** | `admin@company.com` / `ADM001` | `Admin@1234` | บุคคล (HR) | สิทธิ์เต็มทุกเมนู |
| 👤 **EMPLOYEE** | `somying@company.com` / `EMP001` | `Pass@1234` | ไอที (IT) | กะเช้า (09:00 - 18:00) |
| 👤 **EMPLOYEE** | `somsak@company.com` / `EMP002` | `Pass@1234` | ไอที (IT) | กะเช้า (09:00 - 18:00) |
| 👤 **EMPLOYEE** | `sompong@company.com` / `EMP003` | `Pass@1234` | การเงิน (Finance) | กะเช้า (09:00 - 18:00) |
| 👤 **EMPLOYEE** | `somporn@company.com` / `EMP004` | `Pass@1234` | ไอที (IT) | **กะดึก Night Shift (22:00 - 06:00)** |

---

## ⏰ ระบบประมวลผลอัตโนมัติ (Automated Cron Job)

ระบบมี Background Worker (`backend/src/jobs/markAbsent.js`) ทำงานอัตโนมัติทุกวันเวลา **00:05 น. (Asia/Bangkok)**:

```text
[ เริ่มทำงาน 00:05 น. ]
         │
         ├──► วันนี้เป็นวันเสาร์หรืออาทิตย์? ──(ใช่)──► [ ข้ามการประมวลผล (Skip) ]
         │
         ├──► วันนี้เป็นวันหยุดนักขัตฤกษ์ในระบบ? ──(ใช่)──► [ ข้ามการประมวลผล (Skip) ]
         │
         └──► ตรวจสอบพนักงานทุกคนที่ Active:
                 ├── มีประวัติลงเวลาแล้ว? ──(ใช่)──► [ ข้าม ]
                 ├── มีใบลาที่อนุมัติแล้ว? ──(ใช่)──► [ ข้าม ]
                 └── ไม่มีประวัติใดๆ ──► [ บันทึกสถานะเป็น ABSENT (ขาดงาน) ]
```

---

## 💾 การสำรองและกู้คืนฐานข้อมูล (Backup & Restore)

### 🪟 สำหรับ Windows (PowerShell)
```powershell
# สำรองข้อมูล (Backup)
powershell -ExecutionPolicy Bypass -File "scripts/backup.ps1"

# กู้คืนข้อมูล (Restore)
powershell -ExecutionPolicy Bypass -File "scripts/restore.ps1" -BackupFile "backups/backup_attendance_db_xxxx.sql"
```

### 🐧 สำหรับ Linux / Docker (Bash)
```bash
# สำรองข้อมูล (Backup)
chmod +x scripts/*.sh
./scripts/backup.sh

# กู้คืนข้อมูล (Restore)
./scripts/restore.sh backups/backup_attendance_db_xxxx.sql.gz
```

---

## 🧪 การทดสอบและผล Code Coverage (Testing & QA)

ระบบผ่านการทดสอบแบบ **Automated Integration Tests ครอบคลุมทุก Layer (100% Passed)**:

```bash
# รัน Backend Tests พร้อมสรุปตาราง Code Coverage
cd backend
npm run test:coverage

# รัน Frontend Unit Tests
cd ../frontend
npm test

# ตรวจสอบ Production Build
npm run build
```

---

## 🚢 การนำขึ้นใช้งานจริงบน Production (Production Deployment)

1. **เตรียม Server และ Docker:**
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-plugin
   ```
2. **โคลนโปรเจกต์และกำหนดค่า `.env` สำหรับ Production:**
   ```bash
   git clone https://github.com/Disorn1998/Attendance-System-For-Thai-Peoples.git
   cd Attendance-System-For-Thai-Peoples
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. **สั่ง Start Service ด้วย Docker Compose:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
   ```

---

## ❓ การแก้ไขปัญหาที่พบบ่อย (Troubleshooting & FAQ)

#### Q1: ปุ่ม "บันทึกเวลาเข้างาน" กดไม่ได้ หรือขึ้นเตือน "ไม่ได้เชื่อมต่อ WiFi บริษัท"
* **สาเหตุ:** IP Address ของอุปกรณ์ไม่อยู่ในตาราง `CompanyWifiWhitelist`
* **วิธีแก้:** ล็อกอินด้วยบัญชีแอดมิน -> ไปที่เมนู **"WiFi Whitelist"** -> เพิ่ม IP ที่ใช้งานอยู่เข้าไปในระบบ

#### Q2: ล็อกอินไม่สำเร็จ แจ้งเตือน Invalid Credentials
* **สาเหตุ:** ข้อมูลในฐานข้อมูลยังไม่ได้ทำการ Seed
* **วิธีแก้:** รันคำสั่ง `npx prisma db seed` ในโฟลเดอร์ `backend`

#### Q3: พนักงานกะดึก (Night Shift) เช็คอินหลังเที่ยงคืนแล้ววันทำงานผิดหรือไม่?
* **คำตอบ:** ไม่ผิดพลาดแน่นอน ระบบใช้อัลกอริทึม `getWorkDate()` ที่จะผูกกะดึกเข้ากับวันที่เริ่มต้นของกะอย่างถูกต้องอัตโนมัติ

---

## 📄 สัญญาอนุญาต (License)

โปรเจกต์นี้เผยแพร่ภายใต้สัญญาอนุญาต **[MIT License](LICENSE)**

```text
MIT License
Copyright (c) 2026 Disorn Suppartum (Disorn1998)
```

คุณสามารถนำซอร์สโค้ดนี้ไปศึกษา ปรับแต่ง พัฒนาต่อยอด ใช้งานภายในองค์กร หรือนำไปประยุกต์ใช้ในเชิงพาณิชย์ (Commercial Use) ได้อย่างอิสระ 100% โดยไม่มีค่าใช้จ่าย

---

**Developed with ❤️ for Modern Workforce Management**  
*หากพบปัญหาการใช้งานหรือมีข้อเสนอแนะ สามารถเปิด [GitHub Issue](https://github.com/Disorn1998/Attendance-System-For-Thai-Peoples/issues) หรือส่ง Pull Request เข้ามาได้เลยครับ!*

