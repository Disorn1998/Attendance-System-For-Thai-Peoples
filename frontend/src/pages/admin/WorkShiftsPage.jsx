// src/pages/admin/WorkShiftsPage.jsx
// Compact work shift management interface with visual tags and late tolerance indicators

import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.js';
import toast from 'react-hot-toast';

export default function WorkShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
    name: '',
    startTime: '08:30',
    endTime: '17:30',
    lateAfterMinutes: 15,
    isNightShift: false,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchShifts = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getWorkShifts();
      setShifts(data);
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลกะเวลาได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleOpenModal = (shift = null) => {
    if (shift) {
      setEditingShift(shift);
      setFormData({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        lateAfterMinutes: shift.lateAfterMinutes,
        isNightShift: shift.isNightShift,
      });
    } else {
      setEditingShift(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        lateAfterMinutes: Number(formData.lateAfterMinutes),
      };

      if (editingShift) {
        await adminService.updateWorkShift(editingShift.id, payload);
        toast.success('อัปเดตกะเวลาทำงานสำเร็จ');
      } else {
        await adminService.createWorkShift(payload);
        toast.success('เพิ่มกะเวลาทำงานสำเร็จ');
      }

      setIsModalOpen(false);
      fetchShifts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`ยืนยันการลบกะเวลา "${name}"?`)) return;
    try {
      await adminService.deleteWorkShift(id);
      toast.success('ลบกะเวลาสำเร็จ');
      fetchShifts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'ไม่สามารถลบกะเวลาได้');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">จัดการกะเวลาทำงาน</h1>
          <p className="text-sm text-slate-500 mt-1">
            กำหนดเวลาเริ่มงาน เลิกงาน และระยะเวลาผ่อนปรนเข้าสาย ({shifts.length} กะเวลา)
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="ui-btn-primary h-11 px-5 shadow-md hover:shadow-primary-500/25 self-start sm:self-auto font-bold">
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>เพิ่มกะเวลาใหม่</span>
        </button>
      </div>

      <div className="ui-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="ui-table min-w-[700px]">
            <thead>
              <tr>
                <th>ชื่อกะทำงาน</th>
                <th>ช่วงเวลาทำงาน</th>
                <th>ประเภทกะ</th>
                <th>ผ่อนปรนเข้าสาย</th>
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
                      <span>กำลังโหลดข้อมูลกะเวลา...</span>
                    </div>
                  </td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center text-slate-400 text-sm">
                    ยังไม่มีข้อมูลกะเวลาทำงานในระบบ
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift.id} className="transition-colors">
                    <td>
                      <span className="font-bold text-slate-900 text-sm">{shift.name}</span>
                    </td>
                    <td>
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl text-xs border border-slate-200/80 shadow-2xs">
                        {shift.startTime} - {shift.endTime} น.
                      </span>
                    </td>
                    <td>
                      {shift.isNightShift ? (
                        <span className="ui-badge bg-indigo-50 text-indigo-700 border border-indigo-200">
                          กะข้ามคืน (Night Shift) 🌙
                        </span>
                      ) : (
                        <span className="ui-badge bg-amber-50 text-amber-700 border border-amber-200">
                          กะปกติ (Day Shift) ☀️
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="text-slate-700 font-semibold text-xs sm:text-sm">ไม่เกิน {shift.lateAfterMinutes} นาที</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">หลังเวลาเริ่มงาน</span>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(shift)}
                          className="px-3 py-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(shift.id, shift.name)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
              <h3 className="text-base font-bold text-slate-800">
                {editingShift ? 'แก้ไขข้อมูลกะเวลา' : 'เพิ่มกะเวลาใหม่'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  ชื่อกะทำงาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น กะเช้าปกติ, กะบ่าย, กะดึก"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="ui-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    เวลาเริ่มงาน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="ui-input w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    เวลาเลิกงาน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="ui-input w-full font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  ระยะเวลาผ่อนปรนเข้าสาย (นาที) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  required
                  value={formData.lateAfterMinutes}
                  onChange={(e) => setFormData({ ...formData, lateAfterMinutes: e.target.value })}
                  className="ui-input w-full font-mono"
                />
                <p className="text-xs text-slate-400 mt-1">หากเช็คอินหลังเวลานี้ ระบบจะบันทึกสถานะเป็น "สาย"</p>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isNightShift}
                    onChange={(e) => setFormData({ ...formData, isNightShift: e.target.checked })}
                    className="rounded-lg text-primary-600 focus:ring-primary-500 w-4.5 h-4.5"
                  />
                  <span className="text-sm font-medium text-slate-700">กะข้ามคืน (เวลาเลิกงานอยู่ในวันถัดไป) 🌙</span>
                </label>
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
