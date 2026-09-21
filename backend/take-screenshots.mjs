// backend/take-screenshots.mjs
// Automated script to capture real screenshots from the live running web app

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const outputDir = path.join(projectRoot, 'docs', 'screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function navigateSPA(page, hrefSelector) {
  await page.waitForSelector(hrefSelector, { visible: true });
  await page.click(hrefSelector);
  await sleep(1500);
}

async function capture() {
  console.log('🚀 Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  page.on('console', (msg) => console.log('🌐 BROWSER:', msg.text()));

  try {
    // 1. Login Page
    console.log('📸 Capturing 01_login_page.png...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.screenshot({ path: path.join(outputDir, '01_login_page.png') });

    // Login as Employee (somying@company.com / Pass@1234)
    console.log('🔑 Logging in as Employee somying@company.com...');
    await page.evaluate(() => {
      function setVal(input, val) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputs = document.querySelectorAll('input');
      if (inputs[0]) setVal(inputs[0], 'somying@company.com');
      if (inputs[1]) setVal(inputs[1], 'Pass@1234');
    });
    await sleep(300);
    await page.click('button[type="submit"]');
    await sleep(2500);

    // 2. Employee Dashboard
    console.log('📸 Capturing 02_employee_dashboard.png...');
    await page.screenshot({ path: path.join(outputDir, '02_employee_dashboard.png') });

    // 3. Employee Leave Page
    console.log('📸 Capturing 03_employee_leave.png...');
    await navigateSPA(page, 'a[href="/employee/leave"]');
    await page.screenshot({ path: path.join(outputDir, '03_employee_leave.png') });

    // 4. Employee History Page
    console.log('📸 Capturing 04_employee_history.png...');
    await navigateSPA(page, 'a[href="/employee/attendance"]');
    await page.screenshot({ path: path.join(outputDir, '04_employee_history.png') });

    // Logout employee
    console.log('🚪 Logging out employee...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const logout = btns.find((b) => b.textContent.includes('ออกจากระบบ'));
      if (logout) logout.click();
    });
    await sleep(2000);

    // Login as Admin (admin@company.com / Admin@1234)
    console.log('🔑 Logging in as Admin admin@company.com...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await sleep(800);
    await page.evaluate(() => {
      function setVal(input, val) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const inputs = document.querySelectorAll('input');
      if (inputs[0]) setVal(inputs[0], 'admin@company.com');
      if (inputs[1]) setVal(inputs[1], 'Admin@1234');
    });
    await sleep(300);
    await page.click('button[type="submit"]');
    await sleep(2500);

    // 5. Admin Dashboard
    console.log('📸 Capturing 05_admin_dashboard.png...');
    await page.screenshot({ path: path.join(outputDir, '05_admin_dashboard.png') });

    // 6. Admin Leave Requests Page
    console.log('📸 Capturing 06_admin_leave_requests.png...');
    await navigateSPA(page, 'a[href="/admin/leave-requests"]');
    await page.screenshot({ path: path.join(outputDir, '06_admin_leave_requests.png') });

    // 7. Admin Employees Page
    console.log('📸 Capturing 07_admin_employees.png...');
    await navigateSPA(page, 'a[href="/admin/employees"]');
    await page.screenshot({ path: path.join(outputDir, '07_admin_employees.png') });

    // 8. Admin Work Shifts Page
    console.log('📸 Capturing 08_admin_work_shifts.png...');
    await navigateSPA(page, 'a[href="/admin/work-shifts"]');
    await page.screenshot({ path: path.join(outputDir, '08_admin_work_shifts.png') });

    // 9. Admin Departments Page
    console.log('📸 Capturing 09_admin_departments.png...');
    await navigateSPA(page, 'a[href="/admin/departments"]');
    await page.screenshot({ path: path.join(outputDir, '09_admin_departments.png') });

    // 10. Admin WiFi Whitelist Page
    console.log('📸 Capturing 10_admin_wifi_whitelist.png...');
    await navigateSPA(page, 'a[href="/admin/wifi-whitelist"]');
    await page.screenshot({ path: path.join(outputDir, '10_admin_wifi_whitelist.png') });

    // 11. Admin Reports Page
    console.log('📸 Capturing 11_admin_reports.png...');
    await navigateSPA(page, 'a[href="/admin/reports"]');
    await page.screenshot({ path: path.join(outputDir, '11_admin_reports.png') });

    console.log('🎉 All 11 real screenshots captured successfully in docs/screenshots/ !');
  } catch (err) {
    console.error('❌ Error capturing screenshots:', err);
  } finally {
    await browser.close();
  }
}

capture();
