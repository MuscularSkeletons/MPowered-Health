// This file stores and verifies PIN credentials securely on native devices.
import * as SecureStore from 'expo-secure-store';
import { isValidPin } from '../utils/pin-validation';

const key = 'mpowered.pin.v1';

// Build the complete credential before registration writes any account data.
export async function createPinCredential(email: string, pin: string) {
  if (!isValidPin(pin)) throw new Error('Enter exactly four digits.');
  // This payload goes only into the platform's encrypted credential store.
  return JSON.stringify({ version: 1, email: email.trim().toLowerCase(), pin });
}
export function readPinCredential() {
  // SecureStore is backed by the native keychain or encrypted Android storage.
  return SecureStore.getItemAsync(key);
}
export async function writePinCredential(value: string | null) {
  // A null value means account deletion and removes the credential completely.
  if (value === null) await SecureStore.deleteItemAsync(key);
  else
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
}
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
