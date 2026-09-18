// src/pages/admin/EmployeesPage.jsx
// Compact, detailed employee management interface with multi-filters and streamlined modal

import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService.js';
import toast from 'react-hot-toast';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workShifts, setWorkShifts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', departmentId: '', role: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
    employeeCode: '',
    fullName: '',
    email: '',
    password: '',
    departmentId: '',
    position: '',
    workShiftId: '',
    role: 'EMPLOYEE',
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.search) params.search = filters.search;
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.role) params.role = filters.role;

      const res = await adminService.getEmployees(params);
      setEmployees(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลพนักงานได้');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Load dropdown master data once
    adminService.getDepartments().then(setDepartments).catch(() => {});
    adminService.getWorkShifts().then(setWorkShifts).catch(() => {});
  }, []);

  const handleSearchChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setEditingEmp(emp);
      setFormData({
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        email: emp.email,
        password: '',
        departmentId: emp.departmentId || '',
        position: emp.position || '',
        workShiftId: emp.workShiftId || '',
        role: emp.role || 'EMPLOYEE',
        isActive: emp.isActive,
      });
    } else {
      setEditingEmp(null);
      setFormData({
        ...initialForm,
        departmentId: departments[0]?.id || '',
        workShiftId: workShifts[0]?.id || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        departmentId: Number(formData.departmentId),
        workShiftId: Number(formData.workShiftId),
      };

      if (editingEmp) {
        if (!payload.password) delete payload.password;
        await adminService.updateEmployee(editingEmp.id, payload);
        toast.success('อัปเดตข้อมูลพนักงานสำเร็จ');
      } else {
        await adminService.createEmployee(payload);
        toast.success('เพิ่มพนักงานสำเร็จ');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`ยืนยันการลบพนักงาน "${name}"?`)) return;
    try {
      await adminService.deleteEmployee(id);
      toast.success('ลบพนักงานสำเร็จ');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'ไม่สามารถลบพนักงานได้');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">จัดการข้อมูลพนักงาน</h1>
          <p className="text-sm text-slate-500 mt-1">
            รายชื่อพนักงานทั้งหมด ({pagination.total} คน) พร้อมสังกัดแผนกและกะเวลาทำงาน
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="ui-btn-primary h-11 px-5 shadow-md hover:shadow-primary-500/25 self-start sm:self-auto font-bold">
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>เพิ่มพนักงานใหม่</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="ui-card p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[240px] relative">
          <input
            type="text"
            name="search"
            placeholder="ค้นหาชื่อ, รหัสพนักงาน, อีเมล..."
            value={filters.search}
            onChange={handleSearchChange}
            className="ui-input w-full pl-10"
          />
          <svg className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="w-44">
          <select
            name="departmentId"
            value={filters.departmentId}
            onChange={handleSearchChange}
            className="ui-select w-full"
          >
            <option value="">ทุกแผนก</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="w-36">
          <select
            name="role"
            value={filters.role}
            onChange={handleSearchChange}
            className="ui-select w-full"
          >
            <option value="">ทุกสิทธิ์ระบบ</option>
            <option value="EMPLOYEE">พนักงาน</option>
            <option value="ADMIN">ผู้ดูแลระบบ</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="ui-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="ui-table min-w-[900px]">
            <thead>
              <tr>
                <th>รหัสพนักงาน</th>
                <th>ชื่อ-นามสกุล / อีเมล</th>
                <th>แผนก / ตำแหน่ง</th>
                <th>กะเวลาทำงาน</th>
                <th>สิทธิ์ระบบ</th>
                <th>สถานะ</th>
                <th className="text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-14 text-center text-slate-400 text-sm">
                    <div className="flex items-center justify-center gap-2.5">
                      <svg className="animate-spin w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>กำลังโหลดข้อมูลพนักงาน...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-14 text-center text-slate-400 text-sm">
                    ไม่พบข้อมูลพนักงานตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="transition-colors">
                    <td>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-xs border border-slate-200/60">
                        {emp.employeeCode}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {emp.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{emp.fullName}</p>
                          <p className="text-xs text-slate-400 font-mono">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold text-slate-800">{emp.department?.name || '-'}</span>
                      <p className="text-xs text-slate-400">{emp.position || '-'}</p>
                    </td>
                    <td>
                      <span className="font-medium text-slate-700">{emp.workShift?.name || '-'}</span>
                      {emp.workShift && (
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {emp.workShift.startTime} - {emp.workShift.endTime} น.
                        </p>
                      )}
                    </td>
                    <td>
                      {emp.role === 'ADMIN' ? (
                        <span className="ui-badge bg-purple-50 text-purple-700 border border-purple-200">
                          👑 ผู้ดูแลระบบ
                        </span>
                      ) : (
                        <span className="ui-badge bg-slate-100 text-slate-700 border border-slate-200">
                          พนักงานทั่วไป
                        </span>
                      )}
                    </td>
                    <td>
                      {emp.isActive ? (
                        <span className="ui-badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          เปิดใช้งาน
                        </span>
                      ) : (
                        <span className="ui-badge bg-slate-100 text-slate-400 border border-slate-200">
                          ปิดใช้งาน
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(emp)}
                          className="px-3 py-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id, emp.fullName)}
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

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs sm:text-sm text-slate-500">
          <span>
            แสดง <strong className="text-slate-700">{employees.length}</strong> จาก <strong className="text-slate-700">{pagination.total}</strong> รายการ (หน้า {pagination.page} / {pagination.totalPages || 1})
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="ui-btn-secondary h-9 px-3 text-xs sm:text-sm font-medium"
            >
              ก่อนหน้า
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="ui-btn-secondary h-9 px-3 text-xs sm:text-sm font-medium"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-scale-in">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <h3 className="text-base font-bold text-slate-800">
                {editingEmp ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4.5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    รหัสพนักงาน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    placeholder="เช่น EMP005"
                    className="ui-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="เช่น สมชาย ใจดี"
                    className="ui-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="somchai@company.com"
                    className="ui-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {editingEmp ? 'รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)' : 'รหัสผ่าน *'}
                  </label>
                  <input
                    type="text"
                    required={!editingEmp}
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingEmp ? 'เว้นว่างเพื่อใช้รหัสเดิม' : 'อย่างน้อย 8 ตัวอักษร'}
                    className="ui-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    แผนก <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="ui-select w-full"
                  >
                    <option value="">-- เลือกแผนก --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">ตำแหน่งงาน</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="เช่น Software Engineer"
                    className="ui-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    กะเวลาทำงาน <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.workShiftId}
                    onChange={(e) => setFormData({ ...formData, workShiftId: e.target.value })}
                    className="ui-select w-full"
                  >
                    <option value="">-- เลือกกะเวลา --</option>
                    {workShifts.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.startTime} - {w.endTime} น.)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">สิทธิ์การใช้งาน</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="ui-select w-full"
                  >
                    <option value="EMPLOYEE">พนักงานทั่วไป (EMPLOYEE)</option>
                    <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded-lg text-primary-600 focus:ring-primary-500 w-4.5 h-4.5"
                  />
                  <span className="text-sm font-medium text-slate-700">เปิดใช้งานบัญชีนี้ในระบบ</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="ui-btn-secondary px-5"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ui-btn-primary px-6"
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
