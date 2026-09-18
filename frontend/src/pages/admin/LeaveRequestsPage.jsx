// src/pages/admin/LeaveRequestsPage.jsx
// Compact, comprehensive leave request approval interface with status tabs and modal details

import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import { formatDateLong } from '../../utils/dates.js';
import toast from 'react-hot-toast';

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [activeTab, setActiveTab] = useState('PENDING');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [rejectModal, setRejectModal] = useState({ isOpen: false, requestId: null, reason: '' });
  const [detailModal, setDetailModal] = useState({ isOpen: false, req: null });

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (activeTab) params.status = activeTab;

      const res = await api.get('/leave/admin/requests', { params });
      setRequests(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลคำขอลางานได้');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleTabChange = (status) => {
    setActiveTab(status);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleProcess = async (id, status, rejectReason = null) => {
    if (status === 'APPROVED' && !window.confirm('ยืนยันอนุมัติคำขอลางาน? ระบบจะหักโควตาวันลาและสร้างสถานะการเข้างานอัตโนมัติ')) {
      return;
    }

    try {
      await api.post(`/leave/admin/requests/${id}/process`, { status, rejectReason });
      toast.success(status === 'APPROVED' ? 'อนุมัติคำขอลางานสำเร็จ' : 'ปฏิเสธคำขอลางานแล้ว');
      if (status === 'REJECTED') {
        setRejectModal({ isOpen: false, requestId: null, reason: '' });
      }
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">อนุมัติคำขอลางาน</h1>
          <p className="text-sm text-slate-500 mt-1">
            รายการคำขอลางานของบุคลากรในองค์กร ({pagination.total} รายการ)
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl self-start sm:self-auto text-sm font-medium shadow-2xs">
          <button
            onClick={() => handleTabChange('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'PENDING' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⏳ รอพิจารณา
          </button>
          <button
            onClick={() => handleTabChange('APPROVED')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'APPROVED' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✅ อนุมัติแล้ว
          </button>
          <button
            onClick={() => handleTabChange('REJECTED')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'REJECTED' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ❌ ไม่อนุมัติ
          </button>
          <button
            onClick={() => handleTabChange('')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === '' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="ui-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="ui-table min-w-[900px]">
            <thead>
              <tr>
                <th>พนักงาน</th>
                <th>ประเภทการลา</th>
                <th>ช่วงวันที่ลา</th>
                <th>เหตุผลการลา</th>
                <th>สถานะคำขอ</th>
                <th className="text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-14 text-center text-slate-400 text-sm">
                    <div className="flex items-center justify-center gap-2.5">
                      <svg className="animate-spin w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>กำลังโหลดข้อมูลคำขอลา...</span>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-14 text-center text-slate-400 text-sm">
                    ไม่พบคำขอลางานในสถานะนี้
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {req.employee.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{req.employee.fullName}</p>
                          <p className="text-xs text-slate-400 font-medium">
                            {req.employee.employeeCode} • {req.employee.department?.name || 'พนักงาน'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-slate-800 text-sm">{getLeaveTypeName(req.leaveType)}</span>
                      {req.isHalfDay && (
                        <span className="ml-2 px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          ครึ่งวัน
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="font-semibold text-slate-800 text-sm">{formatDateLong(req.startDate)}</span>
                      {req.startDate !== req.endDate && !req.isHalfDay && (
                        <p className="text-xs text-slate-400 font-medium mt-0.5">ถึง {formatDateLong(req.endDate)}</p>
                      )}
                    </td>
                    <td className="max-w-xs">
                      <p
                        className="text-xs sm:text-sm text-slate-600 truncate cursor-pointer hover:text-primary-600 transition-colors font-medium"
                        onClick={() => setDetailModal({ isOpen: true, req })}
                        title="คลิกเพื่อดูรายละเอียด"
                      >
                        {req.reason}
                      </p>
                    </td>
                    <td>
                      {req.status === 'PENDING' && (
                        <span className="ui-badge bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          รออนุมัติ
                        </span>
                      )}
                      {req.status === 'APPROVED' && (
                        <div>
                          <span className="ui-badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                            อนุมัติแล้ว
                          </span>
                          {req.approvedBy && (
                            <p className="text-xs text-slate-400 mt-1">โดย {req.approvedBy.fullName}</p>
                          )}
                        </div>
                      )}
                      {req.status === 'REJECTED' && (
                        <div>
                          <span className="ui-badge bg-red-50 text-red-700 border border-red-200">
                            ไม่อนุมัติ
                          </span>
                          {req.rejectReason && (
                            <p className="text-xs text-red-500 mt-1 max-w-[160px] truncate" title={req.rejectReason}>
                              {req.rejectReason}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      {req.status === 'PENDING' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleProcess(req.id, 'APPROVED')}
                            className="h-9 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xs hover:shadow-md hover:shadow-emerald-500/20 active:scale-95 transition-all"
                          >
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => setRejectModal({ isOpen: true, requestId: req.id, reason: '' })}
                            className="h-9 px-4 rounded-xl text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 active:scale-95 transition-all"
                          >
                            ปฏิเสธ
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">เสร็จสิ้น</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs sm:text-sm text-slate-500">
          <span>แสดงหน้า <strong className="text-slate-700">{pagination.page}</strong> จาก <strong className="text-slate-700">{pagination.totalPages || 1}</strong></span>
          <div className="flex gap-2">
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

      {/* Reject Reason Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-scale-in">
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">ระบุเหตุผลที่ไม่อนุมัติ</h3>
              <button onClick={() => setRejectModal({ isOpen: false, requestId: null, reason: '' })} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <textarea
                rows="3"
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                placeholder="ระบุเหตุผลเพื่อแจ้งให้พนักงานทราบ..."
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/15 outline-none resize-none transition-all shadow-2xs"
              />
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModal({ isOpen: false, requestId: null, reason: '' })}
                  className="ui-btn-secondary px-5"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => handleProcess(rejectModal.requestId, 'REJECTED', rejectModal.reason)}
                  className="ui-btn-danger px-6"
                >
                  ยืนยันไม่อนุมัติ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.isOpen && detailModal.req && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-scale-in">
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">รายละเอียดคำขอลางาน</h3>
              <button onClick={() => setDetailModal({ isOpen: false, req: null })} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white font-bold flex items-center justify-center shadow-xs">
                  {detailModal.req.employee.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{detailModal.req.employee.fullName}</p>
                  <p className="text-xs text-slate-500 font-mono">{detailModal.req.employee.employeeCode} • {detailModal.req.employee.department?.name || 'พนักงาน'}</p>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ประเภทการลา:</span>
                <p className="font-bold text-slate-800 text-base mt-0.5">{getLeaveTypeName(detailModal.req.leaveType)}</p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ช่วงวันที่ลา:</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">
                  {formatDateLong(detailModal.req.startDate)} {detailModal.req.startDate !== detailModal.req.endDate ? `ถึง ${formatDateLong(detailModal.req.endDate)}` : ''}
                </p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">เหตุผลที่ระบุ:</span>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                  {detailModal.req.reason}
                </div>
              </div>
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button onClick={() => setDetailModal({ isOpen: false, req: null })} className="ui-btn-secondary px-6">
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
