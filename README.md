# Employee Attendance System 🚀

ระบบเช็คชื่อพนักงานเต็มรูปแบบ (Full-stack Employee Attendance System) รองรับพนักงาน 200-300 คน สำหรับใช้งานจริงระดับ Production

## 🌟 ฟีเจอร์หลัก (Features)

*   **Role-Based Access Control (RBAC):** แยกสิทธิ์พนักงาน (EMPLOYEE) และผู้ดูแลระบบ (ADMIN)
*   **ระบบเข้างาน/ออกงาน (Check-in/Check-out):**
    *   คำนวณสายอัตโนมัติตามกะการทำงาน
    *   รองรับกะข้ามคืน (Night Shift)
    *   IP Whitelist ตรวจสอบว่าเช็คอินจากอินเทอร์เน็ตของบริษัทเท่านั้น
*   **ระบบลางาน (Leave System):**
    *   โควตาวันลา (Leave Balances) ลาป่วย ลากิจ ลาพักร้อน
    *   ลางานแบบครึ่งวัน (Half-day)
    *   อนุมัติ/ปฏิเสธใบลาผ่าน Admin Dashboard
*   **ระบบอัตโนมัติ (Cron Job):** ตรวจสอบพนักงานขาดงาน (Absent) อัตโนมัติทุกเที่ยงคืน
*   **ระบบรายงาน (Reports):** สรุปชั่วโมงทำงาน และส่งออกเป็น Excel / CSV
*   **ความปลอดภัยสูง:** JWT (Access/Refresh Tokens) คู่กับ `httpOnly` cookie, Rate Limiting, Helmet, และ Hashed Passwords

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### Backend
*   **Node.js & Express:** (ES Modules)
*   **PostgreSQL & Prisma ORM:** ฐานข้อมูลหลัก
*   **JWT & bcrypt:** การยืนยันตัวตนและการเข้ารหัส
*   **node-cron:** สำหรับ Job อัตโนมัติ
*   **Swagger/OpenAPI:** เอกสาร API
*   **Jest:** สำหรับ Unit Testing
*   **Winston & Pino:** Logging
*   **ExcelJS & json2csv:** ส่งออกรายงาน

### Frontend
*   **React 18 & Vite:** เฟรมเวิร์กหลัก
*   **Tailwind CSS:** การออกแบบ UI รองรับ Mobile-first
*   **Zustand:** จัดการ State
*   **React Router:** การนำทาง
*   **Axios:** เชื่อมต่อ API (พร้อมระบบ Auto Token Refresh)

### DevOps & Deployment
*   **Docker & Docker Compose:** Containerization
*   **Nginx:** Reverse Proxy
*   **GitHub Actions:** CI/CD Pipeline

## 🚀 การติดตั้งสำหรับนักพัฒนา (Local Development)

### 1. โคลนโปรเจกต์
\`\`\`bash
git clone <repo-url>
cd attendance-system
\`\`\`

### 2. ตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` เป็น `.env` ทั้งในโฟลเดอร์ `backend` และ `frontend`

### 3. เริ่มต้น Database
\`\`\`bash
# รัน PostgreSQL ผ่าน Docker
make dev-up

# สร้างตารางและ Seed ข้อมูลตัวอย่าง
make db-migrate
make db-seed
\`\`\`

### 4. รัน Backend
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`
*API Docs จะอยู่ที่:* `http://localhost:3000/api/api-docs`

### 5. รัน Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
*หน้าเว็บจะเปิดที่:* `http://localhost:5173`

---

## 🔒 ข้อมูลล็อกอินเริ่มต้น (Seed Data)

*   **Admin:** `admin@example.com` / `admin1234`
*   **Employee:** รหัส `EMP001` / `password123` (หรืออีเมล `somchai@example.com` / `password123`)

---

## 🚢 การนำขึ้นใช้งานจริง (Production Deployment)

ระบบถูกออกแบบมาเพื่อรันบน Linux VM เครื่องเดียว ผ่าน Docker Compose พร้อม Nginx และ SSL

1.  อัปเดตไฟล์ `.env` สำหรับ Production ในเซิร์ฟเวอร์
2.  แก้ไขชื่อโดเมน (Domain Name) ใน `nginx/conf.d/default.conf`
3.  รันคำสั่ง Deploy
\`\`\`bash
make prod-up
make db-migrate
\`\`\`

**สคริปต์ที่เตรียมไว้:**
*   `scripts/deploy.sh`: สำหรับอัปเดตโค้ดและรีสตาร์ทคอนเทนเนอร์
*   `scripts/backup.sh`: สำหรับสำรองข้อมูลฐานข้อมูลรายวัน (แนะนำให้ตั้ง Cron ใน OS)

## 📄 License
MIT License
