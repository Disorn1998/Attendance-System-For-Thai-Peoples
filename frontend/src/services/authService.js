// src/services/authService.js
// API calls for authentication

import api from './api.js';

export const authService = {
  /**
   * Login with email or employeeCode + password
   */
  login: async (login, password) => {
    const response = await api.post('/auth/login', { login, password });
    return response.data.data;
  },

  /**
   * Refresh access token using httpOnly cookie
   */
  refresh: async () => {
    const response = await api.post('/auth/refresh');
    return response.data.data;
  },

  /**
   * Logout — clears server-side token and cookie
   */
  logout: async () => {
    await api.post('/auth/logout');
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const response = await api.put('/employees/me/password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};
