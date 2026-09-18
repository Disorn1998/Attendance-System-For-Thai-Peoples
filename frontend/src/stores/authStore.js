// src/stores/authStore.js
// Zustand store for authentication state.
// Persists auth data to localStorage so user stays logged in on page refresh.
// Access token is kept in memory only (not localStorage) for XSS protection.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ==================== State ====================
      user: null,        // Employee data (no sensitive fields)
      accessToken: null, // JWT access token (in memory, NOT localStorage)
      isLoading: false,
      isInitialized: false,

      // ==================== Actions ====================

      /**
       * Login: authenticate and store user + token
       */
      login: async (login, password) => {
        set({ isLoading: true });
        try {
          const { accessToken, employee } = await authService.login(login, password);
          set({ user: employee, accessToken, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      /**
       * Logout: clear all auth state
       */
      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // Always clear local state even if server request fails
        } finally {
          set({ user: null, accessToken: null });
        }
      },

      /**
       * Refresh access token using httpOnly cookie
       * Called automatically by Axios interceptor on 401 response
       */
      refreshAccessToken: async () => {
        try {
          const { accessToken } = await authService.refresh();
          set({ accessToken });
          return accessToken;
        } catch {
          // Refresh failed — force logout
          set({ user: null, accessToken: null });
          return null;
        }
      },

      /**
       * Update stored user data (e.g., after profile update)
       */
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      /**
       * Computed helpers
       */
      isAuthenticated: () => !!get().accessToken && !!get().user,
      isAdmin: () => get().user?.role === 'ADMIN',
      isEmployee: () => get().user?.role === 'EMPLOYEE',
    }),
    {
      name: 'auth-storage',
      // Only persist user data to localStorage (not access token — XSS risk)
      partialize: (state) => ({ user: state.user }),
    }
  )
);
