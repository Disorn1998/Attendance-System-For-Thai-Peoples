// src/components/layout/EmployeeLayout.jsx
// Modern, friendly employee layout with comfortable density and smooth transitions

import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import { formatDateLong, formatTime } from '../../utils/dates.js';
import toast from 'react-hot-toast';

export default function EmployeeLayout() {
  const { user, logout } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error('ไม่สามารถออกจากระบบได้');
    }
  };

  const navItems = [
    {
      name: 'ลงเวลาทำงาน',
      path: '/employee/dashboard',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      name: 'ประวัติเวลาทำงาน',
      path: '/employee/attendance',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
      name: 'ระบบลางาน',
      path: '/employee/leave',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      name: 'เปลี่ยนรหัสผ่าน',
      path: '/employee/change-password',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-100/80 md:flex-row font-sans text-slate-800 antialiased overflow-hidden">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-[265px] bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        <div className="h-18 px-5 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/25">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-bold text-white leading-tight">ระบบลงเวลา</p>
            <p className="text-xs text-slate-400">Employee Portal</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-900 via-primary-800 to-primary-700 border border-primary-500/30 flex items-center justify-center text-sm font-bold text-primary-300 shrink-0 shadow-sm">
              {user?.fullName?.charAt(0) || 'E'}
            </div>
            <div className="min-w-0">
              <p className="text-[13.5px] font-bold text-slate-100 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.employeeCode} • {user?.department?.name || 'พนักงาน'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3.5 py-4 space-y-2 overflow-y-auto scrollbar-thin">
          <p className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400/90">เมนูหลัก</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-[14.5px] font-medium transition-all duration-200 group ${
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
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2.5 w-full h-11 text-xs sm:text-sm font-bold text-red-300 hover:text-white bg-red-950/30 hover:bg-red-900/60 border border-red-900/50 rounded-xl transition-all duration-150 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-18 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user?.fullName?.charAt(0) || 'E'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 md:hidden">{user?.fullName}</p>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                <span>{formatDateLong(currentTime)}</span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/70 font-mono font-bold text-xs sm:text-sm text-slate-700 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{formatTime(currentTime)} น.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.workShift && (
              <span className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium border border-slate-200/90 shadow-2xs">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>กะงาน: {user.workShift.startTime} - {user.workShift.endTime}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="md:hidden p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="ออกจากระบบ"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/70 p-5 sm:p-7 lg:p-8 pb-24 md:pb-8 scrollbar-thin">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around z-30 shadow-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-primary-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
            </svg>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
