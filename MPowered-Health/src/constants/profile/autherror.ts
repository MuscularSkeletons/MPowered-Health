// contains supabase authentication errors
// source: https://www.iloveblogs.blog/post/supabase-auth-error-codes-typescript
import type { AuthError } from '@supabase/supabase-js';

export const AUTH_ERROR_CODES = [
  'invalid_credentials',
  'email_not_confirmed',
  'user_not_found',
  'weak_password',
  'same_password',
  'email_address_invalid',
  'over_email_send_rate_limit',
  'over_request_rate_limit',
  'signup_disabled',
  'email_exists',
  'user_already_exists',
  'session_expired',
  'refresh_token_not_found',
  'validation_failed',
] as const;

export type AuthErrorCode = typeof AUTH_ERROR_CODES[number];

export type AuthUserError = {
  message: string; // UI msg to show
  /** Which form field to highlight, if any */
  field?: 'email' | 'password' | 'newPassword';
  /** Optional CTA hint for the UI */
  action?: 'resend_confirmation' | 'reset_password' | 'wait' | 'contact_support';
  /** Seconds to wait before retry, when known */
  retryAfter?: number;
};

const ERRORS: Record<AuthErrorCode, AuthUserError> = {
  invalid_credentials: {
    // SECURITY: never disclose whether the email exists.
    message: 'The email or password is incorrect.',
    field: 'password',
  },
  email_not_confirmed: {
    message: 'Please confirm your email before signing in.',
    field: 'email',
    action: 'resend_confirmation',
  },
  user_not_found: {
    // Same message as invalid_credentials — do not leak account existence.
    message: 'The email or password is incorrect.',
    field: 'email',
  },
  weak_password: {
    message:
      'Password must be at least 8 characters and include a number and a symbol, a lowercase and uppercase letter.',
    field: 'password',
  },
  same_password: {
    message: 'Your new password must be different from your current password.',
    field: 'newPassword',
  },
  email_address_invalid: {
    message: 'That email address looks invalid. Double-check the format.',
    field: 'email',
  },
  over_email_send_rate_limit: {
    message: 'Too many requests. Try again in a minute.',
    action: 'wait',
    retryAfter: 60,
  },
  over_request_rate_limit: {
    message: 'You’re going too fast. Please wait a moment.',
    action: 'wait',
    retryAfter: 30,
  },
  signup_disabled: {
    message: 'New signups are currently disabled.',
    action: 'contact_support',
  },
  email_exists: {
    message: 'An account with this email already exists. Try signing in.',
    field: 'email',
    action: 'reset_password',
  },
  user_already_exists: {
    message: 'An account with this email already exists. Try signing in.',
    field: 'email',
    action: 'reset_password',
  },
  session_expired: {
    message: 'Your session expired. Please sign in again.',
  },
  refresh_token_not_found: {
    message: 'Your session expired. Please sign in again.',
  },
  validation_failed: {
    message: 'That email address looks invalid. Double-check the format.',
    field: 'email',
  },
};

const FALLBACK: AuthUserError = {
  message: 'Something went wrong. Please try again.',
};

/**
 * Translate any Supabase AuthError (or unknown error) into a user-facing
 * AuthUserError. Logs the raw error for observability.
 */
export function toUserError(error: unknown): AuthUserError {
  if (!error) return FALLBACK;

  const authError = error as Partial<AuthError>;
  const code = authError.code as AuthErrorCode | undefined;

  if (code && code in ERRORS) {
    return ERRORS[code];
  }

  // Unknown code: log for triage, show fallback
  console.error('[auth] unhandled error', {
    code: authError.code,
    status: authError.status,
    message: authError.message,
  });

  return FALLBACK;
}
