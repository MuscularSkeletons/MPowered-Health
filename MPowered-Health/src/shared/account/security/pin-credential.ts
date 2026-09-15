/** Stores PIN credentials in native encrypted storage and checks entered PINs. */
// This file stores and verifies PIN credentials securely on native devices.
import { isFourDigits as isValidPin } from '@/shared/forms/input-format';
import * as SecureStore from 'expo-secure-store';

const key = 'mpowered.pin.v1';

// Build the complete credential before registration writes any account data.
/** Builds the email and PIN payload that is saved only in the native encrypted credential store. */
export async function createPinCredential(email: string, pin: string) {
  if (!isValidPin(pin)) throw new Error('Enter exactly four digits.');
  // This payload goes only into the platform's encrypted credential store.
  return JSON.stringify({ version: 1, email: email.trim().toLowerCase(), pin });
}

/** Reads the saved PIN credential for this platform. */
export function readPinCredential() {
  // SecureStore is backed by the native keychain or encrypted Android storage.
  return SecureStore.getItemAsync(key);
}

/** Stores the PIN credential, or removes it when given null. */
export async function writePinCredential(value: string | null) {
  // A null value means account deletion and removes the credential completely.
  if (value === null) await SecureStore.deleteItemAsync(key);
  else
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
}

/** Checks whether an entered PIN matches the stored credential. */
export async function matchesPinCredential(raw: string, email: string, pin: string) {
  // Reject malformed data and credentials belonging to a different account.
  if (!isValidPin(pin)) return false;
  const saved = JSON.parse(raw);
  if (
    saved.version !== 1 ||
    saved.email !== email.trim().toLowerCase() ||
    typeof saved.pin !== 'string' ||
    !isValidPin(saved.pin)
  )
    return false;
  let difference = 0;
  // Compare all four positions before returning, rather than exiting at the first mismatch.
  for (let index = 0; index < 4; index++)
    difference |= pin.charCodeAt(index) ^ saved.pin.charCodeAt(index);
  return difference === 0;
}
