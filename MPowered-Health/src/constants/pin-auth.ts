// This file checks PIN sign-in attempts and temporarily locks repeated failures.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from './account';
import { matchesPinCredential, readPinCredential } from './pin-credential';
import { isValidPin } from '../utils/pin-validation';

export const pinAttemptsKey = 'mpowered:pin-attempts';
type Result = { ok: boolean; message?: string };
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
      // Preserve a lock across app restarts by storing its absolute expiry time.
      if (saved.lockedUntil > now)
        return {
          ok: false,
          message: `Too many incorrect attempts. Try again in ${Math.ceil((saved.lockedUntil - now) / 1000)} seconds.`,
        };
      if (await matchesPinCredential(raw, profile.email, pin)) {
        // A successful sign-in clears all earlier failures immediately.
        await AsyncStorage.removeItem(pinAttemptsKey);
        return { ok: true };
      }
      const failures = (saved.lockedUntil ? 0 : Number(saved.failures) || 0) + 1;
      // Five consecutive failures create a one-minute lock on this device.
      const lockedUntil = failures >= 5 ? now + 60000 : 0;
      await AsyncStorage.setItem(pinAttemptsKey, JSON.stringify({ failures, lockedUntil }));
      return {
        ok: false,
        message: lockedUntil
          ? 'Too many incorrect attempts. Try again in 60 seconds.'
          : 'Incorrect PIN. Please try again.',
      };
    });
  checking = run;
  return run;
}
