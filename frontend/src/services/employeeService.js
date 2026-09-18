// src/services/employeeService.js
// Frontend API service for Employee operations (Check-in, Leave, etc.)

import api from './api.js';

export const employeeService = {
  // ==================== Attendance ====================
  getTodayStatus: async () => {
    const res = await api.get('/attendance/today');
    return res.data.data;
  },
  
  checkIn: async () => {
    const res = await api.post('/attendance/check-in');
    return res.data; // Includes message and data
  },
  
  checkOut: async () => {
    const res = await api.post('/attendance/check-out');
    return res.data;
  },

  getMyHistory: async (params) => {
    const res = await api.get('/attendance/history', { params });
    return res.data.data; // { records: [], summary: {} }
  },

  // ==================== Profile ====================
  // (Placeholder for Phase 3/4)
};
