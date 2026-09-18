// src/pages/admin/HolidaysPage.jsx
// Compact holiday calendar management interface with Thai day-of-week and year filter

import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService.js';
import { formatDateLong } from '../../utils/dates.js';
import toast from 'react-hot-toast';

export default function HolidaysPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ date: '', description: '' });

  const fetchHolidays = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getHolidays(selectedYear);
      setHolidays(data);
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลวันหยุดได้');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await adminService.createHoliday(formData);
      toast.success('เพิ่มวันหยุดสำเร็จ');
      setIsModalOpen(false);
      setFormData({ date: '', description: '' });
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, desc) => {
    if (!window.confirm(`ยืนยันการลบวันหยุด "${desc}"?`)) return;
    try {
      await adminService.deleteHoliday(id);
      toast.success('ลบวันหยุดสำเร็จ');
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || 'ไม่สามารถลบวันหยุดได้');
    }
  };

  const getThaiDayOfWeek = (dateStr) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const d = new Date(dateStr);
    return `วัน${days[d.getDay()]}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">ปฏิทินวันหยุดประจำปี</h1>
          <p className="text-sm text-slate-500 mt-1">
            วันหยุดตามประเพณีและวันหยุดบริษัท (ระบบจะไม่ตรวจจับการขาดงานในวันเหล่านี้)
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="ui-select text-sm font-bold h-11 px-4 w-40"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>ปี {y + 543} ({y})</option>
            ))}
          </select>
          <button onClick={() => setIsModalOpen(true)} className="ui-btn-primary h-11 px-5 shadow-md hover:shadow-primary-500/25 font-bold">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>เพิ่มวันหยุด</span>
          </button>
        </div>
      </div>

      <div className="ui-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="ui-table min-w-[700px]">
            <thead>
              <tr>
                <th>วันที่</th>
                <th>วันในสัปดาห์</th>
                <th>ชื่อวันหยุด / รายละเอียด</th>
                <th>สถานะ</th>
                <th className="text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center text-slate-400 text-sm">
                    <div className="flex items-center justify-center gap-2.5">
                      <svg className="animate-spin w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>กำลังโหลดข้อมูลวันหยุด...</span>
                    </div>
                  </td>
                </tr>
              ) : holidays.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center text-slate-400 text-sm">
                    ยังไม่มีข้อมูลวันหยุดสำหรับปี {selectedYear + 543}
                  </td>
                </tr>
              ) : (
                holidays.map((h) => {
                  const holidayDate = new Date(h.date);
                  const isPast = holidayDate < new Date().setHours(0, 0, 0, 0);

                  return (
                    <tr key={h.id} className="transition-colors">
                      <td>
                        <span className="font-bold text-slate-900 text-sm">{formatDateLong(h.date)}</span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                          {getThaiDayOfWeek(h.date)}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium text-slate-900 text-sm">{h.description}</span>
                      </td>
                      <td>
                        {isPast ? (
                          <span className="ui-badge bg-slate-100 text-slate-500 border border-slate-200">ผ่านไปแล้ว</span>
                        ) : (
                          <span className="ui-badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            เร็วๆ นี้
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete(h.id, h.description)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-scale-in">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <h3 className="text-base font-bold text-slate-800">เพิ่มวันหยุดบริษัท</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  วันที่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="ui-input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  ชื่อวันหยุด / รายละเอียด <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น วันขึ้นปีใหม่, วันสงกรานต์, วันหยุดพิเศษบริษัท"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="ui-input w-full"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="ui-btn-secondary px-5">
                  ยกเลิก
                </button>
                <button type="submit" disabled={isSubmitting} className="ui-btn-primary px-6">
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
