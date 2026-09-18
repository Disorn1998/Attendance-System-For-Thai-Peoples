// src/services/adminService.js
// Frontend API service for Admin operations

import api from './api.js';

export const adminService = {
  // ==================== Departments ====================
  getDepartments: async () => {
    const res = await api.get('/admin/departments');
    return res.data.data;
  },
  createDepartment: async (data) => {
    const res = await api.post('/admin/departments', data);
    return res.data.data;
  },
  updateDepartment: async (id, data) => {
    const res = await api.put(`/admin/departments/${id}`, data);
    return res.data.data;
  },
  deleteDepartment: async (id) => {
    await api.delete(`/admin/departments/${id}`);
  },

  // ==================== Work Shifts ====================
  getWorkShifts: async () => {
    const res = await api.get('/admin/work-shifts');
    return res.data.data;
  },
  createWorkShift: async (data) => {
    const res = await api.post('/admin/work-shifts', data);
    return res.data.data;
  },
  updateWorkShift: async (id, data) => {
    const res = await api.put(`/admin/work-shifts/${id}`, data);
    return res.data.data;
  },
  deleteWorkShift: async (id) => {
    await api.delete(`/admin/work-shifts/${id}`);
  },

  // ==================== Holidays ====================
  getHolidays: async (params) => {
    const query = typeof params === 'number' ? { year: params, limit: 100 } : (params || { limit: 100 });
    const res = await api.get('/admin/holidays', { params: query });
    return res.data.data; // contains array of holidays
  },
  createHoliday: async (data) => {
    const res = await api.post('/admin/holidays', data);
    return res.data.data;
  },
  deleteHoliday: async (id) => {
    await api.delete(`/admin/holidays/${id}`);
  },

  // ==================== WiFi Whitelist ====================
  getWifiWhitelist: async () => {
    const res = await api.get('/admin/wifi');
    return res.data.data;
  },
  createWifi: async (data) => {
    const res = await api.post('/admin/wifi', data);
    return res.data.data;
  },
  deleteWifi: async (id) => {
    await api.delete(`/admin/wifi/${id}`);
  },

  // ==================== Employees ====================
  getEmployees: async (params) => {
    const res = await api.get('/admin/employees', { params });
    return res.data; // contains data and pagination
  },
  getEmployeeById: async (id) => {
    const res = await api.get(`/admin/employees/${id}`);
    return res.data.data;
  },
  createEmployee: async (data) => {
    const res = await api.post('/admin/employees', data);
    return res.data.data;
  },
  updateEmployee: async (id, data) => {
    const res = await api.put(`/admin/employees/${id}`, data);
    return res.data.data;
  },
  deleteEmployee: async (id) => {
    await api.delete(`/admin/employees/${id}`);
  },
};
