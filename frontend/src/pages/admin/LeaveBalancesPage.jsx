// src/pages/admin/LeaveBalancesPage.jsx
// Compact master-detail employee leave quota manager with visual progress bars

import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.js';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function LeaveBalancesPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [balances, setBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ leaveType: 'SICK', year: new Date().getFullYear(), totalDays: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getEmployees({ limit: 100, search });
      setEmployees(res.data);
      if (res.data.length > 0 && !selectedEmp) {
        handleSelectEmp(res.data[0]);
      }
    } catch (err) {
      toast.error('ไม่สามารถโหลดรายชื่อพนักงานได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const fetchBalances = async (empId) => {
    try {
      const res = await api.get(`/leave/admin/balances/${empId}`);
      setBalances(res.data.data);
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลยอดวันลาได้');
    }
  };

  const handleSelectEmp = (emp) => {
    setSelectedEmp(emp);
    fetchBalances(emp.id);
  };

  const handleOpenModal = (balance = null) => {
    if (balance) {
      setFormData({
        leaveType: balance.leaveType,
        year: balance.year,
        totalDays: balance.totalDays,
      });
    } else {
      setFormData({ leaveType: 'SICK', year: new Date().getFullYear(), totalDays: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        year: Number(formData.year),
        totalDays: Number(formData.totalDays),
      };

      await api.put(`/leave/admin/balances/${selectedEmp.id}`, payload);
      toast.success('อัปเดตยอดวันลาสำเร็จ');
      setIsModalOpen(false);
      fetchBalances(selectedEmp.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLeaveTypeName = (type) => {
    switch (type) {
      case 'SICK': return 'ลาป่วย';
      case 'PERSONAL': return 'ลากิจ';
      case 'VACATION': return 'ลาพักร้อน';
      default: return 'อื่นๆ';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">จัดการยอดวันลาพนักงาน</h1>
        <p className="text-sm text-slate-500 mt-1">
          กำหนดและปรับปรุงโควตาวันลา (สิทธิวันลาประจำปี) ของพนักงานแต่ละคน
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Employee Selection Pane */}
        <div className="md:col-span-4 ui-card flex flex-col h-[580px] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัสพนักงาน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ui-input w-full text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin">
            {isLoading ? (
              <p className="text-center text-slate-400 py-12 text-sm">กำลังค้นหา...</p>
            ) : employees.length === 0 ? (
              <p className="text-center text-slate-400 py-12 text-sm">ไม่พบพนักงาน</p>
            ) : (
              employees.map((emp) => {
                const isSelected = selectedEmp?.id === emp.id;
                return (
                  <button
                    key={emp.id}
                    onClick={() => handleSelectEmp(emp)}
                    className={`w-full text-left p-3 rounded-2xl transition-all duration-150 flex items-center gap-3 ${
                      isSelected
                        ? 'bg-primary-50 text-primary-900 border border-primary-200 shadow-2xs font-bold'
                        : 'hover:bg-slate-50 border border-transparent text-slate-700'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {emp.fullName?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{emp.fullName}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {emp.employeeCode} • {emp.department?.name || 'พนักงาน'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Balances Detail Pane */}
        <div className="md:col-span-8 ui-card flex flex-col h-[580px] overflow-hidden shadow-xs">
          {selectedEmp ? (
            <>
              {/* Detail Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-blue-500 text-white font-bold flex items-center justify-center shadow-xs">
                    {selectedEmp.fullName?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedEmp.fullName}</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {selectedEmp.employeeCode} • {selectedEmp.department?.name || 'องค์กร'} • {selectedEmp.position || 'พนักงาน'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenModal()}
                  className="ui-btn-primary h-11 px-5 shadow-xs font-bold"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>ปรับโควตา</span>
                </button>
              </div>

              {/* Cards View */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
                {balances.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 text-sm">
                    ยังไม่มีข้อมูลยอดวันลาสำหรับพนักงานรายนี้
                  </div>
                ) : (
                  balances.map((b) => {
                    const remain = b.totalDays - b.usedDays;
                    const percentUsed = b.totalDays > 0 ? Math.min(100, Math.round((b.usedDays / b.totalDays) * 100)) : 0;
                    const isLow = remain <= 1 && b.totalDays > 0;

                    return (
                      <div key={b.id} className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-base font-bold text-slate-900">{getLeaveTypeName(b.leaveType)}</span>
                            <span className="text-xs text-slate-400 font-medium ml-2">(ประจำปี {b.year})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isLow ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                              คงเหลือ {remain} วัน
                            </span>
                            <button
                              onClick={() => handleOpenModal(b)}
                              className="text-xs text-primary-600 hover:text-primary-800 font-bold px-2 py-1 rounded hover:bg-primary-50 transition-colors"
                            >
                              แก้ไข
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentUsed >= 85 ? 'bg-red-500' : percentUsed >= 60 ? 'bg-amber-500' : 'bg-primary-600'
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>ใช้ไปแล้ว <strong className="text-slate-700 font-mono">{b.usedDays}</strong> จากสิทธิทั้งหมด <strong className="text-slate-700 font-mono">{b.totalDays}</strong> วัน</span>
                          <span className="font-mono font-bold text-slate-600">{percentUsed}% ถูกใช้ไป</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm p-8">
              <svg className="w-10 h-10 mb-2.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>เลือกพนักงานจากรายการด้านซ้ายเพื่อดูโควตาวันลา</span>
            </div>
          )}
        </div>
      </div>

      {/* Adjust Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-scale-in">
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-800">ปรับปรุงยอดวันลา</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{selectedEmp?.fullName}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">ประเภทการลา</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="ui-select w-full"
                >
                  <option value="SICK">ลาป่วย</option>
                  <option value="PERSONAL">ลากิจ</option>
                  <option value="VACATION">ลาพักร้อน</option>
                  <option value="OTHER">อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">ปี (ค.ศ.)</label>
                <input
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="ui-input w-full font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">สิทธิวันลาทั้งหมดต่อปี (วัน)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={formData.totalDays}
                  onChange={(e) => setFormData({ ...formData, totalDays: e.target.value })}
                  className="ui-input w-full font-mono"
                />
                <p className="text-xs text-slate-400 mt-1">ระบบจะหักลบกับจำนวนวันที่ใช้ไปแล้วอัตโนมัติ</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
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
