// src/pages/employee/LeavePage.jsx
// Redesigned leave portal with visual quota progress bars, interactive cards, and streamlined request modal

import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import { formatDateLong } from '../../utils/dates.js';
import toast from 'react-hot-toast';

export default function LeavePage() {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = { leaveType: 'SICK', startDate: '', endDate: '', isHalfDay: false, reason: '' };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [balRes, reqRes] = await Promise.all([
        api.get('/leave/my-balances'),
        api.get('/leave/my-requests?limit=20'),
      ]);
      setBalances(balRes.data.data || []);
      setRequests(reqRes.data.data || []);
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลการลาได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = { ...formData };
      if (payload.isHalfDay) {
        payload.endDate = payload.startDate;
      }
      await api.post('/leave/request', payload);
      toast.success('ยื่นคำขอลางานสำเร็จ');
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการยื่นคำขอ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLeaveTypeDetails = (type) => {
    switch (type) {
      case 'SICK':
        return { name: 'ลาป่วย', icon: '🤒', color: 'rose', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
      case 'PERSONAL':
        return { name: 'ลากิจ', icon: '📋', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'VACATION':
        return { name: 'ลาพักร้อน', icon: '🏖️', color: 'primary', bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-200' };
      default:
        return { name: 'อื่นๆ', icon: '📄', color: 'slate', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="ui-badge bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            รออนุมัติ
          </span>
        );
      case 'APPROVED':
        return (
          <span className="ui-badge bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            อนุมัติแล้ว
          </span>
        );
      case 'REJECTED':
        return (
          <span className="ui-badge bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            ไม่อนุมัติ
          </span>
        );
      default:
        return <span className="ui-badge bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary-100/80 text-primary-700">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">ระบบการลางาน</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-11">
            ตรวจสอบโควตาสิทธิวันลาคงเหลือ และส่งคำขอลางานออนไลน์
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="ui-btn-primary self-start sm:self-auto pl-11 sm:pl-5 shadow-glow hover:shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>ยื่นคำขอลางาน</span>
        </button>
      </div>

      {/* Quota Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {balances.map((b) => {
          const detail = getLeaveTypeDetails(b.leaveType);
          const remain = b.totalDays - b.usedDays;
          const percentUsed = b.totalDays > 0 ? Math.min(100, Math.round((b.usedDays / b.totalDays) * 100)) : 0;
          const isLow = remain <= 1 && b.totalDays > 0;

          return (
            <div
              key={b.id}
              className="ui-card p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all bg-white"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl p-2 rounded-xl bg-slate-100/90">{detail.icon}</span>
                    <span className="text-base font-bold text-slate-800">{detail.name}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isLow ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    โควตา {b.totalDays} วัน
                  </span>
                </div>

                <div className="mt-2 mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-3xl font-black font-mono tracking-tight ${isLow ? 'text-rose-600' : 'text-primary-700'}`}>
                      {remain}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">วันคงเหลือ</span>
                  </div>
                </div>

                {/* Modern Visual Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentUsed >= 85 ? 'bg-rose-500' : percentUsed >= 60 ? 'bg-amber-500' : 'bg-primary-600'
                    }`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>ใช้ไปแล้ว <strong className="text-slate-800 font-mono">{b.usedDays}</strong> วัน</span>
                <span>ใช้ไป <strong className="text-slate-800 font-mono">{percentUsed}%</strong></span>
              </div>
            </div>
          );
        })}

        {balances.length === 0 && !isLoading && (
          <div className="col-span-3 text-center py-10 text-sm text-slate-400 ui-card">
            ยังไม่มีข้อมูลโควตาวันลาสำหรับปีนี้ กรุณาติดต่อฝ่ายทรัพยากรบุคคล
          </div>
        )}
      </div>

      {/* Leave Request History Table Card */}
      <div className="ui-card overflow-hidden shadow-xs border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-600"></span>
            <h3 className="text-sm font-bold text-slate-800">ประวัติคำขอลางาน</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">พบ {requests.length} รายการล่าสุด</span>
        </div>

        <div className="overflow-x-auto">
          <table className="ui-table min-w-[700px]">
            <thead>
              <tr>
                <th className="w-40">ประเภทการลา</th>
                <th className="w-60">ช่วงวันที่ลา</th>
                <th>เหตุผลการลา</th>
                <th className="text-right w-44">สถานะคำขอ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-slate-500">กำลังโหลดประวัติการลา...</span>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <span className="p-3 rounded-2xl bg-slate-100 text-slate-400">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                      <p className="text-sm font-semibold text-slate-600 mt-1">ยังไม่มีประวัติการยื่นคำขอลางาน</p>
                      <p className="text-xs text-slate-400">คุณสามารถคลิกปุ่ม &quot;ยื่นคำขอลางาน&quot; ด้านบนเพื่อเริ่มต้นสร้างคำขอใหม่</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const detail = getLeaveTypeDetails(req.leaveType);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{detail.icon}</span>
                          <span className="font-bold text-slate-800">{detail.name}</span>
                          {req.isHalfDay && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                              ครึ่งวัน
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-slate-700">
                        <div className="font-semibold">{formatDateLong(req.startDate)}</div>
                        {req.startDate !== req.endDate && !req.isHalfDay && (
                          <div className="text-xs text-slate-400 mt-0.5">ถึง {formatDateLong(req.endDate)}</div>
                        )}
                      </td>
                      <td className="text-slate-600">
                        <div className="max-w-xs sm:max-w-md truncate" title={req.reason}>
                          {req.reason}
                        </div>
                      </td>
                      <td className="text-right">
                        <div>{getStatusBadge(req.status)}</div>
                        {req.status === 'REJECTED' && req.rejectReason && (
                          <div className="text-xs text-rose-600 mt-1 truncate max-w-[220px] ml-auto bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100" title={req.rejectReason}>
                            เหตุผล: {req.rejectReason}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 scale-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-primary-100 text-primary-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                <h3 className="text-base font-bold text-slate-800">ยื่นแบบฟอร์มขออนุมัติการลา</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ประเภทการลา <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="ui-select w-full"
                >
                  <option value="SICK">🤒 ลาป่วย (Sick Leave)</option>
                  <option value="PERSONAL">📋 ลากิจ (Personal Leave)</option>
                  <option value="VACATION">🏖️ ลาพักร้อน (Vacation Leave)</option>
                </select>
              </div>

              {/* Half-day toggle card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
                <label className="inline-flex items-center gap-3 cursor-pointer select-none w-full">
                  <input
                    type="checkbox"
                    checked={formData.isHalfDay}
                    onChange={(e) => setFormData({ ...formData, isHalfDay: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800">ลาครึ่งวัน (0.5 วันทำการ)</span>
                    <p className="text-xs text-slate-400">เลือกเมื่อต้องการลาเพียงช่วงเช้าหรือบ่ายในวันเดียว</p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className={formData.isHalfDay ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {formData.isHalfDay ? 'วันที่ลา' : 'วันที่เริ่มต้น'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="ui-input w-full"
                  />
                </div>
                {!formData.isHalfDay && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      วันที่สิ้นสุด <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate}
                      className="ui-input w-full"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  เหตุผลการลา <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows="3"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="ระบุรายละเอียดหรือเหตุผลความจำเป็นในการลา..."
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 outline-none resize-none shadow-2xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="ui-btn-secondary"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ui-btn-primary"
                >
                  {isSubmitting ? 'กำลังส่งคำขอ...' : 'ยืนยันยื่นคำขอ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
