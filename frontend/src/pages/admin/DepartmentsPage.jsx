// src/pages/admin/DepartmentsPage.jsx
// Compact department management interface with code badge and inline actions

import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.js';
import { formatDateLong } from '../../utils/dates.js';
import toast from 'react-hot-toast';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getDepartments();
      setDepartments(data);
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลแผนกได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ name: dept.name });
    } else {
      setEditingDept(null);
      setFormData({ name: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = { name: formData.name.trim() };
      if (editingDept) {
        await adminService.updateDepartment(editingDept.id, payload);
        toast.success('อัปเดตแผนกสำเร็จ');
      } else {
        await adminService.createDepartment(payload);
        toast.success('เพิ่มแผนกสำเร็จ');
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`ยืนยันการลบแผนก "${name}"?`)) return;
    try {
      await adminService.deleteDepartment(id);
      toast.success('ลบแผนกสำเร็จ');
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'ไม่สามารถลบแผนกได้');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">จัดการแผนกงาน</h1>
          <p className="text-sm text-slate-500 mt-1">โครงสร้างแผนกงานและสังกัดของบุคลากรภายในองค์กร ({departments.length} แผนก)</p>
        </div>
        <button onClick={() => handleOpenModal()} className="ui-btn-primary h-11 px-5 shadow-md hover:shadow-primary-500/25 self-start sm:self-auto font-bold">
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>เพิ่มแผนกใหม่</span>
        </button>
      </div>

      <div className="ui-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="ui-table min-w-[700px]">
            <thead>
              <tr>
                <th>ชื่อแผนก</th>
                <th>จำนวนบุคลากร</th>
                <th>วันที่สร้าง</th>
                <th className="text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-14 text-center text-slate-400 text-sm">
                    <div className="flex items-center justify-center gap-2.5">
                      <svg className="animate-spin w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>กำลังโหลดข้อมูลแผนก...</span>
                    </div>
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-14 text-center text-slate-400 text-sm">
                    ยังไม่มีข้อมูลแผนกงานในระบบ
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs">
                          🏢
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{dept.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-xl text-xs border border-primary-200/80 shadow-2xs">
                        {dept._count?.employees ?? 0} คน
                      </span>
                    </td>
                    <td className="text-slate-400 text-xs font-medium">{dept.createdAt ? formatDateLong(dept.createdAt) : '-'}</td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(dept)}
                          className="px-3 py-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id, dept.name)}
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
                {editingDept ? 'แก้ไขข้อมูลแผนก' : 'เพิ่มแผนกใหม่'}
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
                  ชื่อแผนก <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ฝ่ายเทคโนโลยีสารสนเทศ, ทรัพยากรบุคคล, การตลาด"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
