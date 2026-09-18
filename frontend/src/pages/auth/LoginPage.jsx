// src/pages/auth/LoginPage.jsx
// Modern, welcoming login interface with smooth micro-interactions and quick demo buttons

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [form, setForm] = useState({ login: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname;

  const validate = () => {
    const newErrors = {};
    if (!form.login.trim()) newErrors.login = 'กรุณากรอกอีเมลหรือรหัสพนักงาน';
    if (!form.password) newErrors.password = 'กรุณากรอกรหัสผ่าน';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    try {
      await login(form.login.trim(), form.password);
      const store = useAuthStore.getState();
      const role = store.user?.role;

      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }

      toast.success('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับครับ 👋');
    } catch (err) {
      const message = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง';
      toast.error(message);
    }
  };

  const setDemoAccount = (loginVal, passVal) => {
    setForm({ login: loginVal, password: passVal });
    setErrors({});
    toast('กรอกข้อมูลทดสอบเรียบร้อย กดเข้าสู่ระบบได้ทันที', { icon: '✨' });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-primary-600 via-primary-500 to-blue-500 rounded-2xl shadow-xl shadow-primary-500/30 mb-3 text-white transition-transform hover:scale-105 duration-200">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">ระบบเช็คชื่อพนักงาน</h1>
          <p className="text-sm text-slate-300 mt-1">Employee Attendance & Leave Management</p>
        </div>

        {/* Modern Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-7 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">ลงชื่อเข้าใช้งาน</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">กรอกอีเมล หรือ รหัสพนักงาน เพื่อเริ่มต้นการทำงาน</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                อีเมล หรือ รหัสพนักงาน
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.login}
                  onChange={(e) => setForm({ ...form, login: e.target.value })}
                  placeholder="กรอกอีเมลหรือรหัสพนักงาน"
                  autoComplete="username"
                  autoFocus
                  className={`ui-input w-full pl-11 h-12 text-[15px] ${errors.login ? 'border-red-400 bg-red-50/50' : ''}`}
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {errors.login && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.login}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="กรอกรหัสผ่าน"
                  autoComplete="current-password"
                  className={`ui-input w-full pl-11 pr-11 h-12 text-[15px] ${errors.password ? 'border-red-400 bg-red-50/50' : ''}`}
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? (
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="ui-btn-primary w-full h-12 text-base font-bold shadow-lg hover:shadow-primary-500/30 mt-3"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>กำลังตรวจสอบ...</span>
                </div>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              ⚡ บัญชีทดสอบด่วน (คลิกเพื่อเลือก)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDemoAccount('admin@company.com', 'Admin@1234')}
                className="p-3 text-left bg-slate-50 hover:bg-primary-50/80 hover:border-primary-300 border border-slate-200/90 rounded-xl transition-all duration-150 active:scale-[0.97] group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-primary-700 flex items-center gap-1">
                  <span>👑</span> ผู้ดูแลระบบ
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">admin@company.com</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('somying@company.com', 'Pass@1234')}
                className="p-3 text-left bg-slate-50 hover:bg-primary-50/80 hover:border-primary-300 border border-slate-200/90 rounded-xl transition-all duration-150 active:scale-[0.97] group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-primary-700 flex items-center gap-1">
                  <span>👤</span> พนักงานทั่วไป
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">somying@company.com</div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-5">
          ระบบเช็คชื่อและจัดการเวลาทำงาน • Version 2.0 Production
        </p>
      </div>
    </div>
  );
}
