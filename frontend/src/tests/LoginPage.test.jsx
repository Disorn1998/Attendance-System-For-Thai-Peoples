// src/tests/LoginPage.test.jsx
// Tests for Login page component

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../pages/auth/LoginPage.jsx';

// Mock Zustand store
vi.mock('../stores/authStore.js', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      login: vi.fn(),
      isLoading: false,
      user: null,
      accessToken: null,
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

const renderLogin = () =>
  render(
    <BrowserRouter>
      <Toaster />
      <LoginPage />
    </BrowserRouter>
  );

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderLogin();
    expect(screen.getByText('ระบบเช็คชื่อพนักงาน')).toBeInTheDocument();
    expect(screen.getByText('เข้าสู่ระบบ')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('กรอกอีเมลหรือรหัสพนักงาน')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('กรอกรหัสผ่าน')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderLogin();
    const submitButton = screen.getByRole('button', { name: 'เข้าสู่ระบบ' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('กรุณากรอกอีเมลหรือรหัสพนักงาน')).toBeInTheDocument();
      expect(screen.getByText('กรุณากรอกรหัสผ่าน')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText('กรอกรหัสผ่าน');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByLabelText('แสดงรหัสผ่าน');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
