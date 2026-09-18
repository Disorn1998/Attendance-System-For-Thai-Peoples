// src/components/layout/AdminLayout.jsx
// Professional, friendly enterprise sidebar layout for Admin with comfortable spacing and micro-interactions

import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import { formatDateLong, formatTime } from '../../utils/dates.js';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error('ไม่สามารถออกจากระบบได้');
    }
  };

  const navGroups = [
    {
      title: 'ภาพรวมระบบ',
      items: [
        {
          name: 'แดชบอร์ดหลัก',
          path: '/admin/dashboard',
          icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        },
      ],
    },
    {
      title: 'ข้อมูลองค์กรและบุคลากร',
      items: [
        {
          name: 'พนักงานทั้งหมด',
          path: '/admin/employees',
          icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        },
        {
          name: 'แผนกงาน',
          path: '/admin/departments',
          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        },
        {
          name: 'กะเวลาทำงาน',
          path: '/admin/work-shifts',
          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
          name: 'ปฏิทินวันหยุด',
          path: '/admin/holidays',
          icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        },
        {
          name: 'WiFi Whitelist',
          path: '/admin/wifi-whitelist',
          icon: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0',
        },
      ],
    },
    {
      title: 'การลงเวลาและการลา',
      items: [
        {
          name: 'อนุมัติการลางาน',
          path: '/admin/leave-requests',
          icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
        },
        {
          name: 'ยอดวันลาพนักงาน',
          path: '/admin/leave-balances',
          icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
        },
      ],
    },
    {
      title: 'รายงานและการวิเคราะห์',
      items: [
        {
          name: 'รายงานรายเดือน',
          path: '/admin/reports',
          icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-slate-100/80 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Comfortable 270px width */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/25">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold text-white tracking-tight">ระบบลงเวลา</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-primary-500/20 text-primary-300 border border-primary-500/30">ADMIN</span>
              </div>
              <p className="text-[11px] text-slate-400">การจัดการบุคลากร</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400/90">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold shadow-sm shadow-primary-600/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 hover:translate-x-1'
                      }`
                    }
                  >
                    <svg className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                    </svg>
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Current User Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center text-sm font-bold text-primary-400 shrink-0 shadow-xs">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-200 truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.employeeCode} • ผู้ดูแลระบบ</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-150 active:scale-95 shrink-0"
              title="ออกจากระบบ"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-18 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Open Sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2.5">
              <span className="text-xs sm:text-sm text-slate-500 font-medium">{formatDateLong(currentTime)}</span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/70 font-mono font-bold text-xs sm:text-sm text-slate-700 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{formatTime(currentTime)} น.</span>
              </div>
            </div>
          </div>

          {/* Quick status & profile pill */}
          <div className="flex items-center gap-3.5">
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ระบบออนไลน์ปกติ
            </div>
            
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">{user?.fullName}</p>
                <p className="text-[11px] text-primary-600 font-semibold">ผู้ดูแลระบบ</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 font-semibold transition-all duration-150 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/70 p-5 sm:p-7 lg:p-8 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
