// src/pages/admin/ReportsPage.jsx
// Modern, insightful monthly attendance reporting interface with export options, KPI metrics, and responsive table

import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { adminService } from '../../services/adminService.js';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [departments, setDepartments] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    departmentId: '',
  });

  useEffect(() => {
    adminService.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/reports/monthly', { params: filters });
      setReportData(res.data.data || []);
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลรายงานได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters.month, filters.year, filters.departmentId]);

  const handleExport = (format) => {
    setIsExporting(true);
    const toastId = toast.loading(`กำลังสร้างไฟล์ ${format.toUpperCase()}...`);

    const params = new URLSearchParams();
    params.append('month', filters.month);
    params.append('year', filters.year);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    params.append('format', format);

    api.get(`/reports/export?${params.toString()}`, { responseType: 'blob' })
      .then((res) => {
        const blob = new Blob([res.data], { type: res.headers['content-type'] });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        const contentDisposition = res.headers['content-disposition'];
        let filename = `Attendance_Report_${filters.year}_${filters.month}.${format}`;
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match) filename = match[1];
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('ดาวน์โหลดไฟล์รายงานสำเร็จ', { id: toastId });
      })
      .catch(() => {
        toast.error('ไม่สามารถส่งออกไฟล์รายงานได้', { id: toastId });
      })
      .finally(() => {
        setIsExporting(false);
      });
  };

  const months = [
    { value: 1, label: 'มกราคม' }, { value: 2, label: 'กุมภาพันธ์' }, { value: 3, label: 'มีนาคม' },
    { value: 4, label: 'เมษายน' }, { value: 5, label: 'พฤษภาคม' }, { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' }, { value: 8, label: 'สิงหาคม' }, { value: 9, label: 'กันยายน' },
    { value: 10, label: 'ตุลาคม' }, { value: 11, label: 'พฤศจิกายน' }, { value: 12, label: 'ธันวาคม' },
  ];

  // Totals calculation
  const totals = reportData.reduce(
    (acc, r) => ({
      present: acc.present + (r.present || 0),
      late: acc.late + (r.late || 0),
      leave: acc.leave + (r.leave || 0),
      absent: acc.absent + (r.absent || 0),
      hours: acc.hours + (r.totalHours || 0),
    }),
    { present: 0, late: 0, leave: 0, absent: 0, hours: 0 }
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary-100/80 text-primary-700">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">รายงานสรุปเวลาทำงานรายเดือน</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-11">
            สรุปสถิติการเข้างาน สาย ลา ขาด และชั่วโมงการทำงานสะสมของพนักงานแบบครบวงจร
          </p>
        </div>

        {/* Export Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto pl-11 sm:pl-0">
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting || reportData.length === 0}
            className="ui-btn-secondary"
            title="ดาวน์โหลดข้อมูลเป็นไฟล์ CSV"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>ส่งออก CSV</span>
          </button>

          <button
            onClick={() => handleExport('xlsx')}
            disabled={isExporting || reportData.length === 0}
            className="ui-btn-primary bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20"
            title="ดาวน์โหลดข้อมูลเป็นไฟล์ Microsoft Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>ส่งออก Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="ui-card p-4 sm:p-5 flex flex-wrap gap-4 items-end bg-white/95">
        <div className="w-full sm:w-48">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            ประจำเดือน
          </label>
          <select
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}
            className="ui-select w-full"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-36">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ปี พ.ศ. / ค.ศ.
          </label>
          <select
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
            className="ui-select w-full"
          >
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>{y + 543} ({y})</option>;
            })}
          </select>
        </div>

        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            แผนกงาน
          </label>
          <select
            value={filters.departmentId}
            onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
            className="ui-select w-full"
          >
            <option value="">ทุกแผนกงานในบริษัท</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:ml-auto text-xs font-medium text-slate-500 py-2.5">
          พบข้อมูลพนักงานทั้งหมด <span className="font-bold text-primary-600 text-sm">{reportData.length}</span> รายการ
        </div>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="ui-card p-4 flex flex-col justify-between border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">มาทำงานปกติ</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight font-mono">
              {totals.present}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">วันทำงานสะสม</p>
          </div>
        </div>

        <div className="ui-card p-4 flex flex-col justify-between border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">เข้างานสาย</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight font-mono">
              {totals.late}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">ครั้งที่เข้างานสาย</p>
          </div>
        </div>

        <div className="ui-card p-4 flex flex-col justify-between border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ลางาน</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight font-mono">
              {totals.leave}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">วันลาที่ได้รับอนุมัติ</p>
          </div>
        </div>

        <div className="ui-card p-4 flex flex-col justify-between border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ขาดงาน</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-rose-700 tracking-tight font-mono">
              {totals.absent}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">วันที่ขาดงาน</p>
          </div>
        </div>

        <div className="ui-card p-4 flex flex-col justify-between col-span-2 lg:col-span-1 border-l-4 border-l-primary-500 bg-gradient-to-br from-white to-primary-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary-700">ชั่วโมงทำงานรวม</span>
            <span className="p-1.5 rounded-lg bg-primary-100/80 text-primary-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-primary-900 tracking-tight font-mono">
              {Math.round(totals.hours * 10) / 10}
            </div>
            <p className="text-[11px] text-primary-600/80 mt-0.5">ชั่วโมงปฏิบัติงานรวม</p>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="ui-card overflow-hidden shadow-xs border border-slate-200">
        <div className="overflow-x-auto">
          <table className="ui-table min-w-[900px]">
            <thead>
              <tr>
                <th className="w-36">รหัสพนักงาน</th>
                <th>ชื่อ-นามสกุล</th>
                <th>แผนกงาน</th>
                <th className="text-center w-28">มาปกติ (วัน)</th>
                <th className="text-center w-28">สาย (ครั้ง)</th>
                <th className="text-center w-28">ลา (วัน)</th>
                <th className="text-center w-28">ขาด (วัน)</th>
                <th className="text-right w-36">ชั่วโมงสะสม</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-slate-500">กำลังประมวลผลข้อมูลสรุปประจำเดือน...</span>
                    </div>
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <span className="p-3 rounded-2xl bg-slate-100 text-slate-400">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                      <p className="text-sm font-semibold text-slate-600 mt-1">ไม่พบข้อมูลการทำงานในเดือนที่เลือก</p>
                      <p className="text-xs text-slate-400">กรุณาเลือกเดือน ปี หรือแผนกงานอื่นเพื่อแสดงรายงาน</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td>
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs border border-slate-200/80 shadow-2xs">
                        {row.employeeCode}
                      </span>
                    </td>
                    <td className="font-semibold text-slate-800">{row.fullName}</td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {row.department || '-'}
                      </span>
                    </td>
                    <td className="text-center font-mono font-bold text-emerald-600">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100">
                        {row.present}
                      </span>
                    </td>
                    <td className="text-center font-mono font-bold text-amber-600">
                      <span className={`inline-block px-2.5 py-1 rounded-lg ${row.late > 0 ? 'bg-amber-50 border border-amber-100' : 'text-slate-400'}`}>
                        {row.late}
                      </span>
                    </td>
                    <td className="text-center font-mono font-bold text-purple-600">
                      <span className={`inline-block px-2.5 py-1 rounded-lg ${row.leave > 0 ? 'bg-purple-50 border border-purple-100' : 'text-slate-400'}`}>
                        {row.leave}
                      </span>
                    </td>
                    <td className="text-center font-mono font-bold text-rose-600">
                      <span className={`inline-block px-2.5 py-1 rounded-lg ${row.absent > 0 ? 'bg-rose-50 border border-rose-100' : 'text-slate-400'}`}>
                        {row.absent}
                      </span>
                    </td>
                    <td className="text-right font-mono font-black text-slate-900 text-sm">
                      {row.totalHours} <span className="text-xs font-normal text-slate-400 font-sans">ชม.</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Totals Summary Row */}
            {reportData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-slate-900">
                  <td colSpan="3" className="py-4 px-4.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-600"></span>
                      <span className="text-sm font-bold">รวมทั้งสิ้น ({reportData.length} พนักงาน)</span>
                    </div>
                  </td>
                  <td className="text-center font-mono text-emerald-700 py-4 px-4.5 text-sm">
                    {totals.present} วัน
                  </td>
                  <td className="text-center font-mono text-amber-700 py-4 px-4.5 text-sm">
                    {totals.late} ครั้ง
                  </td>
                  <td className="text-center font-mono text-purple-700 py-4 px-4.5 text-sm">
                    {totals.leave} วัน
                  </td>
                  <td className="text-center font-mono text-rose-700 py-4 px-4.5 text-sm">
                    {totals.absent} วัน
                  </td>
                  <td className="text-right font-mono text-primary-900 py-4 px-4.5 text-base font-black">
                    {Math.round(totals.hours * 10) / 10} <span className="text-xs font-normal text-slate-500 font-sans">ชม.</span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
