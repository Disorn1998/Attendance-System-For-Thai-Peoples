// src/pages/employee/DashboardPage.jsx
// Modern, friendly employee check-in dashboard with interactive buttons, glowing clock, and live status

import { useState, useEffect, useCallback } from 'react';
import { employeeService } from '../../services/employeeService.js';
import { useAuthStore } from '../../stores/authStore.js';
import { formatTime, formatDateLong } from '../../utils/dates.js';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await employeeService.getTodayStatus();
      setStatus(data);
    } catch (err) {
      toast.error('ไม่สามารถโหลดสถานะการทำงานได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  const handleCheckIn = async () => {
    try {
      setIsSubmitting(true);
      await employeeService.checkIn();
      toast.success('เช็คอินลงเวลาสำเร็จ ขอให้เป็นวันที่ดีครับ! 🎉');
      fetchTodayStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'เช็คอินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsSubmitting(true);
      await employeeService.checkOut();
      toast.success('เช็คเอาต์เรียบร้อย ขอบคุณสำหรับการทำงานวันนี้ครับ! 👏');
      fetchTodayStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'เช็คเอาต์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    if (!status?.hasCheckedIn) {
      return (
        <span className="ui-badge bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          ยังไม่ลงเวลาเข้างาน
        </span>
      );
    }
    if (status.attendance?.status === 'PRESENT') {
      return (
        <span className="ui-badge bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          เข้างานปกติ
        </span>
      );
    }
    if (status.attendance?.status === 'LATE') {
      return (
        <span className="ui-badge bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          เข้างานสาย
        </span>
      );
    }
    if (status.attendance?.status === 'HALF_DAY_LEAVE') {
      return (
        <span className="ui-badge bg-sky-50 text-sky-700 border border-sky-200">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          ลาครึ่งวัน
        </span>
      );
    }
    return (
      <span className="ui-badge bg-purple-50 text-purple-700 border border-purple-200">
        {status?.attendance?.status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
        <svg className="animate-spin w-5 h-5 text-primary-600 mr-2.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        กำลังโหลดข้อมูลประจำวัน...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Hero Attendance Panel */}
      <div className="ui-card p-6 sm:p-8 bg-white border border-slate-200/90 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        {/* Top vibrant indicator bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-600" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left: Greeting, Date, and Digital Clock */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200/80">
                {user?.department?.name || 'องค์กร'}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono font-semibold">{user?.employeeCode}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              สวัสดี, {user?.fullName} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">{formatDateLong(currentTime)}</p>

            {/* Proportional, crisp digital clock with soft dark glow */}
            <div className="mt-4 inline-flex items-baseline gap-2.5 px-5 py-2.5 rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/15 border border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse self-center"></span>
              <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-white">
                {formatTime(currentTime)}
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">น.</span>
            </div>
          </div>

          {/* Right: Interactive Check-in / Check-out Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3.5 w-full md:w-auto shrink-0">
            <button
              onClick={handleCheckIn}
              disabled={isSubmitting || status?.hasCheckedIn}
              className={`flex-1 sm:flex-initial h-14 sm:h-15 px-7 sm:px-8 rounded-2xl font-bold text-[15px] sm:text-base flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 ${
                status?.hasCheckedIn
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white shadow-md shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/35 hover:-translate-y-0.5'
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>{status?.hasCheckedIn ? 'เช็คอินเรียบร้อย' : 'บันทึกเวลาเข้างาน'}</span>
            </button>

            <button
              onClick={handleCheckOut}
              disabled={isSubmitting || !status?.hasCheckedIn || status?.hasCheckedOut}
              className={`flex-1 sm:flex-initial h-14 sm:h-15 px-7 sm:px-8 rounded-2xl font-bold text-[15px] sm:text-base flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 ${
                !status?.hasCheckedIn || status?.hasCheckedOut
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-0.5'
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{status?.hasCheckedOut ? 'เช็คเอาต์เรียบร้อย' : 'บันทึกเวลาออกงาน'}</span>
            </button>
          </div>
        </div>

        {/* Security / WiFi confirmation strip */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          {status?.isWifiAllowed ? (
            <span className="flex items-center gap-2 font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>เชื่อมต่อเครือข่ายบริษัทแล้ว {status?.clientIp ? `(IP: ${status.clientIp})` : ''}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>อยู่นอกเครือข่ายบริษัท {status?.clientIp ? `(IP: ${status.clientIp})` : ''} — ไม่สามารถเช็คอินได้</span>
            </span>
          )}
          <span className="font-mono text-xs text-slate-400 font-semibold">Asia/Bangkok (GMT+7)</span>
        </div>
      </div>

      {/* Two-Column Status Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Today's Log Card */}
        <div className="ui-card p-6 hover:border-slate-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-xs">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              บันทึกเวลาของวันนี้
            </h3>
            {getStatusBadge()}
          </div>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-500">เวลาเข้างานจริง</span>
              <span className="font-mono font-bold text-slate-800 text-[15px]">
                {status?.attendance?.checkInTime ? formatTime(status.attendance.checkInTime) : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-500">เวลาออกงานจริง</span>
              <span className="font-mono font-bold text-slate-800 text-[15px]">
                {status?.attendance?.checkOutTime ? formatTime(status.attendance.checkOutTime) : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-500">ชั่วโมงทำงานวันนี้</span>
              <span className="font-mono font-bold text-primary-600 text-lg">
                {status?.attendance?.workingHours ? `${status.attendance.workingHours} ชม.` : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Work Shift Detail Card */}
        <div className="ui-card p-6 hover:border-slate-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              ข้อมูลกะเวลาการทำงาน
            </h3>
            {user?.workShift?.isNightShift && (
              <span className="ui-badge bg-indigo-50 text-indigo-700 border border-indigo-200">
                กะกลางคืน 🌙
              </span>
            )}
          </div>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-500">ชื่อกะทำงาน</span>
              <span className="font-bold text-slate-800">{user?.workShift?.name || 'กะปกติ'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-500">ช่วงเวลาทำงาน</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl text-xs sm:text-sm">
                {user?.workShift?.startTime || '08:30'} - {user?.workShift?.endTime || '17:30'} น.
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-500">เกณฑ์ผ่อนปรนเข้าสาย</span>
              <span className="text-amber-700 font-bold text-xs sm:text-sm bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/60">
                ไม่เกิน {user?.workShift?.lateAfterMinutes || 15} นาที
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
