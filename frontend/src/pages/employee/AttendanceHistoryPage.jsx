// src/pages/employee/AttendanceHistoryPage.jsx
// Detailed employee attendance history with day-of-week, formatted duration, and modern KPI metrics

import { useState, useEffect, useCallback } from 'react';
import { employeeService } from '../../services/employeeService.js';
import { formatTime, formatDateLong, formatWorkingHours } from '../../utils/dates.js';
import toast from 'react-hot-toast';

export default function AttendanceHistoryPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await employeeService.getMyHistory({ month, year });
      setRecords(data.records || []);
      setSummary(data.summary || null);
    } catch (err) {
      toast.error('ไม่สามารถโหลดประวัติการเข้างานได้');
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const months = [
    { value: 1, label: 'มกราคม' },
    { value: 2, label: 'กุมภาพันธ์' },
    { value: 3, label: 'มีนาคม' },
    { value: 4, label: 'เมษายน' },
    { value: 5, label: 'พฤษภาคม' },
    { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' },
    { value: 8, label: 'สิงหาคม' },
    { value: 9, label: 'กันยายน' },
    { value: 10, label: 'ตุลาคม' },
    { value: 11, label: 'พฤศจิกายน' },
    { value: 12, label: 'ธันวาคม' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="ui-badge bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            มาทำงาน
          </span>
        );
      case 'LATE':
        return (
          <span className="ui-badge bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            สาย
          </span>
        );
      case 'ABSENT':
        return (
          <span className="ui-badge bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            ขาดงาน
          </span>
        );
      case 'ON_LEAVE':
        return (
          <span className="ui-badge bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            ลางาน
          </span>
        );
      case 'HALF_DAY_LEAVE':
        return (
          <span className="ui-badge bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            ลาครึ่งวัน
          </span>
        );
      default:
        return <span className="ui-badge bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getThaiDayOfWeek = (dateStr) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const d = new Date(dateStr);
    return `วัน${days[d.getDay()]}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary-100/80 text-primary-700">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">ประวัติการบันทึกเวลา</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-11">
            ตรวจสอบประวัติเวลาเข้า-ออกงานย้อนหลังและสถิติเวลาสะสมรายเดือน
          </p>
        </div>

        {/* Month / Year Selectors */}
        <div className="flex items-center gap-3 pl-11 sm:pl-0">
          <div className="w-40">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="ui-select w-full"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="ui-select w-full"
            >
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y + 543} ({y})</option>;
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Summary Metric Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="ui-card p-4 text-center hover:shadow-md transition-all">
            <span className="text-xs font-semibold text-slate-500">วันทำงานทั้งหมด</span>
            <p className="text-2xl font-black text-slate-800 mt-1.5 font-mono">
              {summary.totalDays} <span className="text-xs font-medium text-slate-400 font-sans">วัน</span>
            </p>
          </div>

          <div className="ui-card p-4 text-center border-l-4 border-l-amber-500 hover:shadow-md transition-all">
            <span className="text-xs font-semibold text-amber-700">เข้างานสาย</span>
            <p className="text-2xl font-black text-amber-600 mt-1.5 font-mono">
              {summary.lateCount} <span className="text-xs font-medium text-slate-400 font-sans">ครั้ง</span>
            </p>
          </div>

          <div className="ui-card p-4 text-center border-l-4 border-l-rose-500 hover:shadow-md transition-all">
            <span className="text-xs font-semibold text-rose-700">ขาดงาน</span>
            <p className="text-2xl font-black text-rose-600 mt-1.5 font-mono">
              {summary.absentCount} <span className="text-xs font-medium text-slate-400 font-sans">วัน</span>
            </p>
          </div>

          <div className="ui-card p-4 text-center border-l-4 border-l-purple-500 hover:shadow-md transition-all">
            <span className="text-xs font-semibold text-purple-700">ลางาน</span>
            <p className="text-2xl font-black text-purple-600 mt-1.5 font-mono">
              {summary.leaveCount} <span className="text-xs font-medium text-slate-400 font-sans">วัน</span>
            </p>
          </div>

          <div className="ui-card p-4 text-center col-span-2 sm:col-span-1 bg-gradient-to-br from-primary-50/70 to-indigo-50/40 border-primary-200 hover:shadow-md transition-all">
            <span className="text-xs font-bold text-primary-800">ชั่วโมงรวม</span>
            <p className="text-2xl font-black text-primary-900 mt-1.5 font-mono">
              {formatWorkingHours(summary.totalHours)}
            </p>
          </div>
        </div>
      )}

      {/* Attendance Table Card */}
      <div className="ui-card overflow-hidden shadow-xs border border-slate-200">
        <div className="overflow-x-auto">
          <table className="ui-table min-w-[650px]">
            <thead>
              <tr>
                <th className="w-56">วันที่ทำงาน</th>
                <th>เวลาเข้างาน</th>
                <th>เวลาออกงาน</th>
                <th className="text-center">ชั่วโมงทำงาน</th>
                <th className="text-right">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-slate-500">กำลังโหลดประวัติการบันทึกเวลา...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <span className="p-3 rounded-2xl bg-slate-100 text-slate-400">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <p className="text-sm font-semibold text-slate-600 mt-1">ไม่พบข้อมูลการบันทึกเวลาในเดือนนี้</p>
                      <p className="text-xs text-slate-400">เมื่อคุณลงเวลาเข้า-ออกงาน ข้อมูลจะปรากฏที่นี่โดยอัตโนมัติ</p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td>
                      <div className="font-bold text-slate-900">{formatDateLong(rec.date)}</div>
                      <div className="inline-flex items-center text-xs text-slate-500 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1.5"></span>
                        {getThaiDayOfWeek(rec.date)}
                      </div>
                    </td>
                    <td className="font-mono font-semibold text-slate-800">
                      {rec.checkInTime ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {formatTime(rec.checkInTime)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="font-mono font-semibold text-slate-800">
                      {rec.checkOutTime ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                          {formatTime(rec.checkOutTime)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="text-center font-mono font-bold text-slate-800">
                      {rec.workingHours ? (
                        <span className="text-primary-700 bg-primary-50/60 px-2.5 py-1 rounded-lg border border-primary-100">
                          {formatWorkingHours(rec.workingHours)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="text-right">
                      {getStatusBadge(rec.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
