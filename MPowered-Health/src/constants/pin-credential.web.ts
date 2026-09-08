import AsyncStorage from '@react-native-async-storage/async-storage';
import { isValidPin } from '../utils/pin-validation';

const key = 'mpowered:pin-credential:v1';
const iterations = 600000;
const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
const unhex = (value: string) =>
  Uint8Array.from(value.match(/.{2}/g) ?? [], (byte) => parseInt(byte, 16));

async function derive(pin: string, salt: Uint8Array) {
  if (!globalThis.crypto?.subtle) throw new Error('PIN sign-in requires HTTPS or localhost.');
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: new Uint8Array(salt), iterations },
    material,
    256,
  );
  return hex(new Uint8Array(bits));
}

export async function createPinCredential(email: string, pin: string) {
  if (!isValidPin(pin)) throw new Error('Enter exactly four digits.');
  if (!globalThis.crypto?.subtle) throw new Error('PIN sign-in requires HTTPS or localhost.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return JSON.stringify({
    version: 1,
    email: email.trim().toLowerCase(),
    salt: hex(salt),
    hash: await derive(pin, salt),
  });
}
export function readPinCredential() {
  return AsyncStorage.getItem(key);
}
export async function writePinCredential(value: string | null) {
  if (value === null) await AsyncStorage.removeItem(key);
  else await AsyncStorage.setItem(key, value);
}
export async function matchesPinCredential(raw: string, email: string, pin: string) {
  if (!isValidPin(pin)) return false;
  const saved = JSON.parse(raw);
  if (
    saved.version !== 1 ||
    saved.email !== email.trim().toLowerCase() ||
    !/^[0-9a-f]{32}$/.test(saved.salt) ||
    !/^[0-9a-f]{64}$/.test(saved.hash)
  )
    return false;
  const hash = await derive(pin, unhex(saved.salt));
  let difference = 0;
  for (let index = 0; index < hash.length; index++)
    difference |= hash.charCodeAt(index) ^ saved.hash.charCodeAt(index);
  return difference === 0;
}
