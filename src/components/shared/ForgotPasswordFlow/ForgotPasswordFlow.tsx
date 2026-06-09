'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import styles from './ForgotPasswordFlow.module.css';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  useRequestResetOtp,
  useVerifyResetOtp,
  useResetPasswordWithToken,
  getApiErrorMessage,
} from '@/hooks/useForgotPassword';

type Step = 'email' | 'otp' | 'password' | 'done';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

// Password strength rules — mirror the API requirements exactly.
const PASSWORD_RULES: { id: string; label: string; test: (pw: string) => boolean }[] = [
  { id: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'lower', label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { id: 'digit', label: 'One number', test: (pw) => /\d/.test(pw) },
  {
    id: 'special',
    label: 'One special character',
    test: (pw) => /[!@#$%^&*(),.?":{}|<>_\-+=/[\]]/.test(pw),
  },
];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ---- icons ----

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M14.1667 17.0833H5.83333C3.33333 17.0833 1.66667 15.8333 1.66667 12.9167V7.08333C1.66667 4.16667 3.33333 2.91667 5.83333 2.91667H14.1667C16.6667 2.91667 18.3333 4.16667 18.3333 7.08333V12.9167C18.3333 15.8333 16.6667 17.0833 14.1667 17.0833Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.1667 7.5L11.5583 9.58333C10.7 10.2667 9.29167 10.2667 8.43333 9.58333L5.83333 7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M5 8.33333V6.66667C5 3.90833 5.83333 1.66667 10 1.66667C14.1667 1.66667 15 3.90833 15 6.66667V8.33333"
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

function EyeToggle({ shown, onClick }: { shown: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={styles.eyeBtn}
      onClick={onClick}
      aria-label={shown ? 'Hide password' : 'Show password'}
    >
      {shown ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
            d="M7.01666 16.275C7.96666 16.675 8.975 16.8917 10 16.8917C12.9417 16.8917 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00833 17.5917 7.83333"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.89166 12.1083L1.66666 18.3333M18.3333 1.66667L12.1083 7.89167"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
}

// ---- OTP input ----

interface OtpInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? '');
    onChange(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    refs.current[focusIndex]?.focus();
  };

  return (
    <div className={styles.otpRow} onPaste={handlePaste}>
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={styles.otpBox}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ---- main flow ----

export const ForgotPasswordFlow = () => {
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const requestOtp = useRequestResetOtp();
  const verifyOtp = useVerifyResetOtp();
  const resetPassword = useResetPasswordWithToken();

  // Resend cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const otpValue = otp.join('');
  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(newPassword) })),
    [newPassword]
  );
  const allRulesPass = passwordChecks.every((c) => c.passed);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const sendOtp = () => {
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    requestOtp.mutate(
      { email: email.trim() },
      {
        onSuccess: (data) => {
          toast.success(data.message || 'A reset code has been sent to your email.');
          setOtp(Array(OTP_LENGTH).fill(''));
          setCooldown(RESEND_COOLDOWN_SECONDS);
          setStep('otp');
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, 'Could not send reset code. Please try again.'));
        },
      }
    );
  };

  const resendOtp = () => {
    if (cooldown > 0) return;
    requestOtp.mutate(
      { email: email.trim() },
      {
        onSuccess: (data) => {
          toast.success(data.message || 'A new reset code has been sent.');
          setOtp(Array(OTP_LENGTH).fill(''));
          setCooldown(RESEND_COOLDOWN_SECONDS);
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, 'Could not resend reset code. Please try again.'));
        },
      }
    );
  };

  const submitOtp = () => {
    if (otpValue.length !== OTP_LENGTH) {
      toast.error('Please enter the full 6-digit code.');
      return;
    }
    verifyOtp.mutate(
      { email: email.trim(), otp: otpValue },
      {
        onSuccess: (data) => {
          setResetToken(data.reset_token);
          toast.success(data.message || 'Code verified. Set your new password.');
          setStep('password');
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, 'Incorrect reset code. Please try again.'));
        },
      }
    );
  };

  const submitNewPassword = () => {
    if (!allRulesPass) {
      toast.error('Your password does not meet all the requirements.');
      return;
    }
    if (!passwordsMatch) {
      toast.error('Passwords do not match.');
      return;
    }
    resetPassword.mutate(
      { reset_token: resetToken, new_password: newPassword },
      {
        onSuccess: (data) => {
          toast.success(data.message || 'Your password has been reset successfully.');
          setStep('done');
        },
        onError: (err) => {
          const msg = getApiErrorMessage(err, 'Could not reset password. Please try again.');
          toast.error(msg);
          // Token expired / invalid → send the user back to the start of the flow.
          if (/expired|invalid reset token|restart/i.test(msg)) {
            setStep('email');
            setOtp(Array(OTP_LENGTH).fill(''));
            setResetToken('');
          }
        },
      }
    );
  };

  const headers: Record<Step, { title: string; subtitle: string }> = {
    email: {
      title: 'Forgot password?',
      subtitle: 'Enter your account email and we’ll send you a 6-digit reset code.',
    },
    otp: {
      title: 'Enter reset code',
      subtitle: `We sent a 6-digit code to ${email}. It expires in 15 minutes.`,
    },
    password: {
      title: 'Set a new password',
      subtitle: 'Choose a strong password you haven’t used before.',
    },
    done: {
      title: 'Password reset',
      subtitle: 'Your password has been updated successfully.',
    },
  };

  return (
    <div className={styles.root}>
      {/* Step header */}
      <div className={styles.header}>
        <span className={styles.stepBadge}>
          {step === 'done' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <LockIcon />
          )}
        </span>
        <h2 className={styles.title}>{headers[step].title}</h2>
        <p className={styles.subtitle}>{headers[step].subtitle}</p>
      </div>

      {/* Progress dots */}
      {step !== 'done' && (
        <div className={styles.steps} aria-hidden>
          {(['email', 'otp', 'password'] as Step[]).map((s, i) => (
            <span
              key={s}
              className={`${styles.dot} ${
                step === s ? styles.dotActive : ''
              } ${['email', 'otp', 'password'].indexOf(step) > i ? styles.dotDone : ''}`}
            />
          ))}
        </div>
      )}

      {/* Step: email */}
      {step === 'email' && (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            sendOtp();
          }}
        >
          <Input
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            leftIcon={<MailIcon />}
            autoFocus
          />
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={requestOtp.isPending}
            className={styles.primaryBtn}
          >
            Send reset code
          </Button>
        </form>
      )}

      {/* Step: otp */}
      {step === 'otp' && (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            submitOtp();
          }}
        >
          <OtpInput value={otp} onChange={setOtp} disabled={verifyOtp.isPending} />

          <div className={styles.resendRow}>
            <span>Didn’t get the code?</span>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={resendOtp}
              disabled={cooldown > 0 || requestOtp.isPending}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={verifyOtp.isPending}
            disabled={otpValue.length !== OTP_LENGTH}
            className={styles.primaryBtn}
          >
            Verify code
          </Button>

          <button
            type="button"
            className={styles.backLink}
            onClick={() => {
              setStep('email');
              setOtp(Array(OTP_LENGTH).fill(''));
            }}
          >
            ← Use a different email
          </button>
        </form>
      )}

      {/* Step: password */}
      {step === 'password' && (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            submitNewPassword();
          }}
        >
          <Input
            label="New password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            leftIcon={<LockIcon />}
            rightIcon={
              <EyeToggle shown={showPassword} onClick={() => setShowPassword((s) => !s)} />
            }
            autoFocus
          />

          <ul className={styles.checklist}>
            {passwordChecks.map((c) => (
              <li key={c.id} className={c.passed ? styles.checkPass : styles.checkPending}>
                <span className={styles.checkIcon} aria-hidden>
                  {c.passed ? '✓' : '○'}
                </span>
                {c.label}
              </li>
            ))}
          </ul>

          <Input
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            leftIcon={<LockIcon />}
            error={
              confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : undefined
            }
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={resetPassword.isPending}
            disabled={!allRulesPass || !passwordsMatch}
            className={styles.primaryBtn}
          >
            Reset password
          </Button>
        </form>
      )}

      {/* Step: done */}
      {step === 'done' && (
        <div className={styles.form}>
          <p className={styles.doneText}>You can now sign in with your new password.</p>
          <Button
            type="button"
            fullWidth
            size="lg"
            className={styles.primaryBtn}
            onClick={() => router.push('/login')}
          >
            Back to login
          </Button>
        </div>
      )}

      {step !== 'done' && (
        <a href="/login" className={styles.bottomLink}>
          ← Back to login
        </a>
      )}
    </div>
  );
};
