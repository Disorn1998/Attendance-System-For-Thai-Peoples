// src/App.jsx
// Main application router.
// Uses React.lazy for code splitting — each page is loaded on demand.
// Routes are protected by ProtectedRoute component.

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore.js';
import { ProtectedRoute } from './components/shared/ProtectedRoute.jsx';

// ==================== Lazy-loaded pages ====================
// Auth
const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'));

// Employee pages (Phase 3 onwards)
const EmployeeDashboard = lazy(() => import('./pages/employee/DashboardPage.jsx'));
const AttendanceHistoryPage = lazy(() => import('./pages/employee/AttendanceHistoryPage.jsx'));
const LeavePage = lazy(() => import('./pages/employee/LeavePage.jsx'));
const ChangePasswordPage = lazy(() => import('./pages/employee/ChangePasswordPage.jsx'));

// Admin pages (Phase 2 onwards)
const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage.jsx'));
const EmployeesPage = lazy(() => import('./pages/admin/EmployeesPage.jsx'));
const DepartmentsPage = lazy(() => import('./pages/admin/DepartmentsPage.jsx'));
const WorkShiftsPage = lazy(() => import('./pages/admin/WorkShiftsPage.jsx'));
const HolidaysPage = lazy(() => import('./pages/admin/HolidaysPage.jsx'));
const WifiWhitelistPage = lazy(() => import('./pages/admin/WifiWhitelistPage.jsx'));
const LeaveRequestsPage = lazy(() => import('./pages/admin/LeaveRequestsPage.jsx'));
const LeaveBalancesPage = lazy(() => import('./pages/admin/LeaveBalancesPage.jsx'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage.jsx'));

// ==================== Loading Fallback ====================
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <svg className="animate-spin w-10 h-10 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-gray-500">กำลังโหลด...</p>
    </div>
  </div>
);

// ==================== Root Redirect ====================
const RootRedirect = () => {
  const { user, accessToken } = useAuthStore();
  if (!user || !accessToken) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
};

import AdminLayout from './components/layout/AdminLayout.jsx';
import EmployeeLayout from './components/layout/EmployeeLayout.jsx';

// ==================== Lazy-loaded pages ====================
// ... (lazy imports)

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root — redirect based on auth */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Employee routes with Layout */}
        <Route path="/employee" element={
          <ProtectedRoute requiredRole="EMPLOYEE">
            <EmployeeLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="attendance" element={<AttendanceHistoryPage />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* Admin routes with Layout */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }>
          {/* Index route redirects to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="work-shifts" element={<WorkShiftsPage />} />
          <Route path="holidays" element={<HolidaysPage />} />
          <Route path="wifi-whitelist" element={<WifiWhitelistPage />} />
          <Route path="leave-requests" element={<LeaveRequestsPage />} />
          <Route path="leave-balances" element={<LeaveBalancesPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* 404 — redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
