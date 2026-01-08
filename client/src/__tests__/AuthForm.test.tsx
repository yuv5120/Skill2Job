import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

// Mock firebase
vi.mock('../firebase', () => ({
  auth: {},
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
}));

describe('AuthForm', () => {
  const mockSetEmail = vi.fn();
  const mockSetPassword = vi.fn();
  const mockHandleSubmit = vi.fn((e) => e.preventDefault());

  it('renders login form with email and password fields', () => {
    render(
      <AuthForm
        email=""
        setEmail={mockSetEmail}
        password=""
        setPassword={mockSetPassword}
        handleSubmit={mockHandleSubmit}
        buttonText="Sign In"
      />
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls submit handler when form is submitted', async () => {
    const user = userEvent.setup();
    render(
      <AuthForm
        email="test@example.com"
        setEmail={mockSetEmail}
        password="password123"
        setPassword={mockSetPassword}
        handleSubmit={mockHandleSubmit}
        buttonText="Sign In"
      />
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('displays different button text based on mode', () => {
    const { rerender } = render(
      <AuthForm
        email=""
        setEmail={mockSetEmail}
        password=""
        setPassword={mockSetPassword}
        handleSubmit={mockHandleSubmit}
        buttonText="Sign In"
      />
    );

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

    rerender(
      <AuthForm
        email=""
        setEmail={mockSetEmail}
        password=""
        setPassword={mockSetPassword}
        handleSubmit={mockHandleSubmit}
        buttonText="Sign Up"
      />
    );

    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });
});
