// src/pages/employee/ChangePasswordPage.jsx
// Secure, friendly password change page with live policy checklist, strength meter, and visibility toggles

import { useState } from 'react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Policy validation checks
  const hasMinLength = formData.newPassword.length >= 8;
  const hasLetter = /[A-Za-z]/.test(formData.newPassword);
  const hasNumber = /[0-9]/.test(formData.newPassword);
  const isMatched = formData.newPassword && formData.newPassword === formData.confirmPassword;
  const isFormValid = hasMinLength && hasLetter && hasNumber && isMatched && formData.currentPassword;

  // Strength score (0 to 3)
  const strengthScore = [hasMinLength, hasLetter, hasNumber].filter(Boolean).length;
  const strengthLabels = ['ยังไม่ปลอดภัย', 'ระดับเริ่มต้น', 'ระดับปานกลาง', 'ปลอดภัยสูง'];
  const strengthColors = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้องตามเงื่อนไขความปลอดภัย');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/auth/change-password', formData);
      toast.success(res.data.message || 'เปลี่ยนรหัสผ่านสำเร็จ');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-primary-100/80 text-primary-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">เปลี่ยนรหัสผ่าน</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1 pl-11">
          เพื่อความปลอดภัยของบัญชีผู้ใช้ กรุณาตั้งรหัสผ่านที่รัดกุมและไม่ซ้ำกับบริการอื่น
        </p>
      </div>

      {/* Main Form Card */}
      <div className="ui-card p-6 sm:p-8 bg-white/95 rounded-3xl shadow-card border border-slate-200/90">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>รหัสผ่านปัจจุบัน <span className="text-rose-500">*</span></span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="กรอกรหัสผ่านปัจจุบันของคุณ"
                className="ui-input w-full pr-11"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
                title={showCurrent ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showCurrent ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>รหัสผ่านใหม่ <span className="text-rose-500">*</span></span>
              {formData.newPassword && (
                <span className={`text-[11px] font-bold ${strengthScore === 3 ? 'text-emerald-600' : strengthScore === 2 ? 'text-amber-600' : 'text-rose-500'}`}>
                  {strengthLabels[strengthScore]}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                className="ui-input w-full pr-11"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
                title={showNew ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showNew ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>

            {/* Password strength bar */}
            {formData.newPassword && (
              <div className="mt-2 flex gap-1.5 h-1.5 w-full">
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthScore >= 1 ? strengthColors[strengthScore] : 'bg-slate-200'}`} />
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthScore >= 2 ? strengthColors[strengthScore] : 'bg-slate-200'}`} />
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthScore >= 3 ? strengthColors[strengthScore] : 'bg-slate-200'}`} />
              </div>
            )}
          </div>

          {/* Interactive Policy Checklist */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-xs">
            <p className="font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              ข้อกำหนดความปลอดภัยของรหัสผ่าน:
            </p>
            <div className={`flex items-center gap-2.5 transition-colors ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${hasMinLength ? 'bg-emerald-100 text-emerald-700 shadow-2xs' : 'bg-slate-200 text-slate-400'}`}>
                {hasMinLength ? '✓' : '•'}
              </span>
              <span>ความยาวอย่างน้อย 8 ตัวอักษร</span>
            </div>
            <div className={`flex items-center gap-2.5 transition-colors ${hasLetter ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${hasLetter ? 'bg-emerald-100 text-emerald-700 shadow-2xs' : 'bg-slate-200 text-slate-400'}`}>
                {hasLetter ? '✓' : '•'}
              </span>
              <span>มีตัวอักษรภาษาอังกฤษ (A-Z, a-z) อย่างน้อย 1 ตัว</span>
            </div>
            <div className={`flex items-center gap-2.5 transition-colors ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${hasNumber ? 'bg-emerald-100 text-emerald-700 shadow-2xs' : 'bg-slate-200 text-slate-400'}`}>
                {hasNumber ? '✓' : '•'}
              </span>
              <span>มีตัวเลขอารบิก (0-9) อย่างน้อย 1 ตัว</span>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>ยืนยันรหัสผ่านใหม่ <span className="text-rose-500">*</span></span>
              {formData.confirmPassword && isMatched && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <span>✓ รหัสผ่านตรงกัน</span>
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้งเพื่อยืนยัน"
                className={`ui-input w-full pr-11 ${
                  formData.confirmPassword && !isMatched ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/20' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
                title={showConfirm ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showConfirm ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            {formData.confirmPassword && !isMatched && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                <span>⚠️ รหัสผ่านใหม่ไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง</span>
              </p>
            )}
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="ui-btn-primary w-full h-12 text-[15px] font-bold shadow-glow hover:shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังบันทึกรหัสผ่านใหม่...</span>
                </div>
              ) : (
                'บันทึกรหัสผ่านใหม่'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
