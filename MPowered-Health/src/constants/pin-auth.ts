// This file checks PIN sign-in attempts and requires email verification after repeated failures.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from './account';
import { matchesPinCredential, readPinCredential } from './pin-credential';
import { isValidPin } from '../utils/pin-validation';

export const pinAttemptsKey = 'mpowered:pin-attempts';
type Result = { ok: boolean; message?: string; requiresEmailVerification?: boolean };
// Queue checks so rapid taps cannot update the failure count at the same time.
let checking: Promise<unknown> = Promise.resolve();

export function verifyAccountPin(pin: string): Promise<Result> {
  // Each verification joins the queue before it reads or changes the attempt record.
  const run = checking
    .catch(() => undefined)
    .then(async (): Promise<Result> => {
      if (!isValidPin(pin)) return { ok: false, message: 'Enter exactly four digits.' };
      // A PIN is useful only when both its account profile and credential still exist.
      const profile = await getProfile();
      const raw = await readPinCredential();
      if (!profile || !raw)
        return { ok: false, message: 'No PIN is set up for this account on this device.' };
      const saved = JSON.parse(
        (await AsyncStorage.getItem(pinAttemptsKey)) ?? '{"failures":0,"lockedUntil":0}',
      );
      const now = Date.now();
      // Preserve the recovery requirement across restarts. Treat an older active lockout
      // record as requiring email too, so upgrades do not weaken an existing restriction.
      if (saved.verificationRequired === true || saved.lockedUntil > now)
        return {
          ok: false,
          requiresEmailVerification: true,
          message: 'Too many incorrect PIN attempts. Verify your email address to continue.',
        };
      if (await matchesPinCredential(raw, profile.email, pin)) {
        // A successful sign-in clears all earlier failures immediately.
        await AsyncStorage.removeItem(pinAttemptsKey);
        return { ok: true };
      }
      const failures = (saved.lockedUntil ? 0 : Number(saved.failures) || 0) + 1;
      // Five consecutive failures switch this device from PIN entry to email recovery.
      const verificationRequired = failures >= 5;
      await AsyncStorage.setItem(
        pinAttemptsKey,
        JSON.stringify({ failures, verificationRequired }),
      );
      return {
        ok: false,
        requiresEmailVerification: verificationRequired || undefined,
        message: verificationRequired
          ? 'Too many incorrect PIN attempts. Verify your email address to continue.'
          : 'Incorrect PIN. Please try again.',
      };
    });
  checking = run;
  return run;
}
