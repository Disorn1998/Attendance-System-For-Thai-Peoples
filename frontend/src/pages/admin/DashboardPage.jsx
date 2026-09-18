// src/pages/admin/DashboardPage.jsx
// Modern, friendly admin dashboard with interactive KPI cards, hover elevation, and quick shortcuts

import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { formatDateLong } from '../../utils/dates.js';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setSummary(res.data.data);
      } catch (err) {
        toast.error('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 text-sm">
        <svg className="animate-spin w-5 h-5 text-primary-600 mr-2.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        กำลังประมวลผลข้อมูลภาพรวม...
      </div>
    );
  }

  const total = summary?.totalEmployees || 0;
  const present = summary?.today.present || 0;
  const late = summary?.today.late || 0;
  const leave = summary?.today.leave || 0;
  const absentOrPending = (summary?.today.absent || 0) + (summary?.today.noRecord || 0);

  const presentRate = total > 0 ? Math.round((present / total) * 100) : 0;
  const lateRate = total > 0 ? Math.round((late / total) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">ภาพรวมระบบการลงเวลา</h1>
          <p className="text-sm text-slate-500 mt-1">
            ข้อมูลประจำวันที่ {formatDateLong(new Date())} • พนักงานทั้งหมด <span className="font-bold text-slate-900">{total}</span> คน
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/reports"
            className="ui-btn-secondary text-sm font-semibold hover:border-slate-400 active:scale-95 shadow-xs"
          >
            <svg className="w-4.5 h-4.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ดูรายงานฉบับเต็ม
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid with Interactive Elevation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Present Card */}
        <div className="ui-card p-6 border-l-4 border-l-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>มาทำงานปกติ</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform animate-pulse"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">{present}</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 font-mono bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              {presentRate}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${presentRate}%` }}
            />
          </div>
        </div>

        {/* Late Card */}
        <div className="ui-card p-6 border-l-4 border-l-amber-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>เข้างานสาย</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">{late}</span>
            <span className="text-xs sm:text-sm font-bold text-amber-600 font-mono bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
              {lateRate}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${lateRate}%` }}
            />
          </div>
        </div>

        {/* Leave Card */}
        <div className="ui-card p-6 border-l-4 border-l-purple-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>ลางาน (อนุมัติ)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 group-hover:scale-125 transition-transform"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">{leave}</span>
            <span className="text-xs sm:text-sm text-purple-600 font-bold">คน</span>
          </div>
          <p className="text-xs text-slate-400 mt-4 truncate">ลาป่วย / ลากิจ / ลาพักร้อน</p>
        </div>

        {/* Absent/Pending Card */}
        <div className="ui-card p-6 border-l-4 border-l-rose-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>ขาดงาน / รอเช็คอิน</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 group-hover:scale-125 transition-transform"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">{absentOrPending}</span>
            <span className="text-xs sm:text-sm text-rose-600 font-bold">คน</span>
          </div>
          <p className="text-xs text-slate-400 mt-4 truncate">ตรวจจับขาดงานอัตโนมัติ 00:05 น.</p>
        </div>
      </div>

      {/* Quick Navigation Cards with Interactive Hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/employees"
          className="ui-card p-5 hover:border-primary-400/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center gap-3.5 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-primary-500/25 transition-all duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-primary-700 transition-colors truncate">
              จัดการพนักงาน
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">รายชื่อ ข้อมูล สังกัดแผนก</p>
          </div>
        </Link>

        <Link
          to="/admin/work-shifts"
          className="ui-card p-5 hover:border-blue-400/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center gap-3.5 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-500/25 transition-all duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
              กะเวลาทำงาน
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">กำหนดเวลาและเกณฑ์สาย</p>
          </div>
        </Link>

        <Link
          to="/admin/leave-requests"
          className="ui-card p-5 hover:border-amber-400/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center gap-3.5 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-amber-500/25 transition-all duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-amber-700 transition-colors truncate">
              อนุมัติการลา
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">ตรวจสอบใบลาและโควตา</p>
          </div>
        </Link>

        <Link
          to="/admin/wifi-whitelist"
          className="ui-card p-5 hover:border-indigo-400/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center gap-3.5 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-indigo-500/25 transition-all duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors truncate">
              WiFi Whitelist
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">IP บริษัทที่ให้ลงเวลาได้</p>
          </div>
        </Link>
      </div>

      {/* Summary Info Banner with Elegant Gradient */}
      <div className="ui-card p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-primary-400 shrink-0 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm sm:text-base font-bold text-slate-100">ระบบตรวจจับการขาดงานอัตโนมัติ (Automated Absent Cron Job)</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              ระบบทำงานอัตโนมัติทุกวันเวลา 00:05 น. (Asia/Bangkok) ยกเว้นวันเสาร์-อาทิตย์, วันหยุดบริษัท และวันที่มีใบลาที่ได้รับอนุมัติ
            </p>
          </div>
        </div>
        <span className="shrink-0 px-3.5 py-1.5 rounded-xl bg-emerald-950/90 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold tracking-wider shadow-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          ACTIVE
        </span>
      </div>
    </div>
  );
}
