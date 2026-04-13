'use client';

import { useState } from 'react';
import styles from './LoginForm.module.css';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLogin } from '@/hooks/useAuth';

export interface LoginFormProps {
  className?: string;
}

export const LoginForm = ({ className }: LoginFormProps) => {
  const loginMutation = useLogin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    loginMutation.mutate(
      { username, password },
      {
        onError: (error: unknown) => {
          const axiosError = error as {
            response?: { data?: { detail?: { msg?: string }[]; message?: string } };
          };
          const msg =
            axiosError?.response?.data?.detail?.[0]?.msg ||
            axiosError?.response?.data?.message ||
            'Login failed. Please check your credentials.';
          setErrorMsg(msg);
        },
      }
    );
  };

  const usernameIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.1667 17.0833H5.83333C3.33333 17.0833 1.66667 15.8333 1.66667 12.9167V7.08333C1.66667 4.16667 3.33333 2.91667 5.83333 2.91667H14.1667C16.6667 2.91667 18.3333 4.16667 18.3333 7.08333V12.9167C18.3333 15.8333 16.6667 17.0833 14.1667 17.0833Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.1667 7.5L11.5583 9.58333C10.7 10.2667 9.29167 10.2667 8.43333 9.58333L5.83333 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const lockIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 8.33333V6.66667C5 3.90833 5.83333 1.66667 10 1.66667C14.1667 1.66667 15 3.90833 15 6.66667V8.33333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 15.4167C11.1506 15.4167 12.0833 14.4839 12.0833 13.3333C12.0833 12.1827 11.1506 11.25 10 11.25C8.84941 11.25 7.91667 12.1827 7.91667 13.3333C7.91667 14.4839 8.84941 15.4167 10 15.4167Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.1667 18.3333H5.83333C2.5 18.3333 1.66667 17.5 1.66667 14.1667V12.5C1.66667 9.16667 2.5 8.33333 5.83333 8.33333H14.1667C17.5 8.33333 18.3333 9.16667 18.3333 12.5V14.1667C18.3333 17.5 17.5 18.3333 14.1667 18.3333Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const eyeToggle = (
    <button
      type="button"
      className={styles.togglePassword}
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.1083 7.89166L7.89166 12.1083C7.35 11.5667 7.01666 10.825 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C10.825 7.01666 11.5667 7.35 12.1083 7.89166Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.85 4.80833C13.3917 3.70833 11.725 3.10833 10 3.10833C7.05833 3.10833 4.31667 4.84166 2.40833 7.84166C1.65833 9.01666 1.65833 10.9917 2.40833 12.1667C3.06667 13.2 3.83333 14.0917 4.66667 14.8083"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.01666 16.275C7.96666 16.675 8.975 16.8917 10 16.8917C12.9417 16.8917 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00833 17.5917 7.83333C17.3167 7.39999 17.0167 6.99166 16.7083 6.60833"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.925 10.5833C12.7083 11.7583 11.75 12.7167 10.575 12.9333"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.89166 12.1083L1.66666 18.3333"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.3333 1.66667L12.1083 7.89167"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 16.8917C12.9417 16.8917 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.01666 17.5917 7.84166C15.6833 4.84166 12.9417 3.10833 10 3.10833C7.05833 3.10833 4.31667 4.84166 2.40833 7.84166C1.65833 9.01666 1.65833 10.9833 2.40833 12.1583C4.31667 15.1583 7.05833 16.8917 10 16.8917Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );

  return (
    <form className={`${styles.root} ${className || ''}`} onSubmit={handleSubmit} id="login-form">
      {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

      {/* Username */}
      <div className={styles.field}>
        <Input
          label="Username"
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          leftIcon={usernameIcon}
        />
      </div>

      {/* Password */}
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="login-password" className={styles.label}>
            Password
          </label>
          <a href="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </a>
        </div>
        <Input
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          leftIcon={lockIcon}
          rightIcon={eyeToggle}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={loginMutation.isPending}
        className={styles.submitButton}
        id="sign-in-button"
      >
        Sign In to Dashboard
      </Button>
    </form>
  );
};
