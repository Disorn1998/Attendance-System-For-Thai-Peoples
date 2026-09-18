// src/pages/admin/WifiWhitelistPage.jsx
// Compact IP whitelist management interface with copy helper and clean modal

import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.js';
import toast from 'react-hot-toast';

export default function WifiWhitelistPage() {
  const [wifis, setWifis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ ipAddress: '', description: '' });

  const fetchWifis = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getWifiWhitelist();
      setWifis(data);
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูล WiFi ได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWifis();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ipAddress: formData.ipAddress.trim(),
        description: formData.description.trim(),
      };
      await adminService.createWifi(payload);
      toast.success('เพิ่ม IP สำเร็จ');
      setIsModalOpen(false);
      setFormData({ ipAddress: '', description: '' });
      fetchWifis();
    } catch (err) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, ip) => {
    if (!window.confirm(`ยืนยันการลบ IP "${ip}" ออกจากรายการที่อนุญาต?`)) return;
    try {
      await adminService.deleteWifi(id);
      toast.success('ลบ IP สำเร็จ');
      fetchWifis();
    } catch (err) {
      toast.error(err.response?.data?.message || 'ไม่สามารถลบ IP ได้');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('คัดลอก IP แล้ว');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">จัดการเครือข่ายบริษัท (IP Whitelist)</h1>
          <p className="text-sm text-slate-500 mt-1">
            พนักงานต้องเชื่อมต่ออินเทอร์เน็ตผ่าน IP เหล่านี้เท่านั้นจึงจะสามารถบันทึกเวลาเข้า-ออกงานได้ ({wifis.length} จุด)
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="ui-btn-primary h-11 px-5 shadow-md hover:shadow-primary-500/25 self-start sm:self-auto font-bold">
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>เพิ่ม IP เครือข่าย</span>
        </button>
      </div>

      {/* Info Tip */}
      <div className="ui-card p-4.5 bg-primary-50/60 border-primary-200/80 flex items-center justify-between text-sm text-primary-950 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>
            <strong className="font-bold text-primary-900">คำแนะนำ:</strong> IP Address คือ Public IP ของ Router บริษัท สามารถตรวจสอบได้โดยพิมพ์ "what is my ip" บน Google
          </span>
        </div>
      </div>

      <div className="ui-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="ui-table min-w-[700px]">
            <thead>
              <tr>
                <th>IP Address</th>
                <th>สถานที่ติดตั้ง / คำอธิบาย</th>
                <th>สถานะการอนุญาต</th>
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
                      <span>กำลังโหลดข้อมูล IP Whitelist...</span>
                    </div>
                  </td>
                </tr>
              ) : wifis.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-14 text-center text-slate-400 text-sm">
                    ยังไม่มีข้อมูล IP Whitelist ในระบบ
                  </td>
                </tr>
              ) : (
                wifis.map((w) => (
                  <tr key={w.id} className="transition-colors">
                    <td>
                      <div className="inline-flex items-center gap-2 font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl text-xs sm:text-sm border border-slate-200/80 shadow-2xs">
                        <span>{w.ipAddress}</span>
                        <button
                          onClick={() => copyToClipboard(w.ipAddress)}
                          title="คัดลอก IP"
                          className="text-slate-400 hover:text-primary-600 hover:bg-slate-200/60 p-1 rounded-lg transition-colors active:scale-95"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="font-bold text-slate-800 text-sm">{w.description}</td>
                    <td>
                      <span className="ui-badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        อนุญาตให้เช็คอิน
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(w.id, w.ipAddress)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ลบ
                      </button>
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
              <h3 className="text-base font-bold text-slate-800">เพิ่ม IP Address บริษัท</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  IP Address (Public IP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 124.120.45.10 หรือ ::1 (Localhost)"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className="ui-input w-full font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  สถานที่ติดตั้ง / คำอธิบาย <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น WiFi ชั้น 3 อาคาร A, HQ สำนักงานใหญ่"
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
