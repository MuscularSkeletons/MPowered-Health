/** Loads, saves, and deletes the local account and coordinates feature cleanup. */
import { profileErrors, type Profile } from '@/shared/account/profile';
import { markAssessmentCompleted, resetAssessmentSession } from '@/shared/health-records/session';
import { isFourDigits as isValidPin } from '@/shared/forms/input-format';
import {
  createPinCredential,
  readPinCredential,
  writePinCredential,
} from '@/shared/account/security/pin-credential';
import {
  finishPainHistoryWrites,
  getPainHistory,
  loadPainHistory,
} from '@/shared/health-records/pain-history';
import AsyncStorage from '@react-native-async-storage/async-storage';
export { emptyProfile, profileErrors, type Profile } from '@/shared/account/profile';

const profileKey = 'mpowered:profile';
const deletedKey = 'mpowered:account-deleted';
const deletedEmailKey = 'mpowered:deleted-account-email';

/** Loads the saved profile and rejects data with an unexpected shape. */
export async function getProfile(): Promise<Profile | null> {
  // Validate persisted JSON before letting a screen treat it as a profile.
  const stored = await AsyncStorage.getItem(profileKey);
  if (!stored) return null;
  const value = JSON.parse(stored);
  if (
    !value ||
    ['email', 'name', 'sex', 'birthYear', 'diagnosis', 'otherConditions'].some(
      (key) => typeof value[key] !== 'string',
    ) ||
    !Array.isArray(value.conditions) ||
    value.conditions.some((item: unknown) => typeof item !== 'string')
  ) {
    throw new Error('Invalid profile data');
  }
  return value;
}

/** Validates and saves profile details, then notifies account listeners. */
export async function saveProfile(profile: Profile) {
  // Trim text and copy arrays so only clean, caller-independent values are saved.
  if (Object.keys(profileErrors(profile)).length) throw new Error('Invalid profile answers');
  const clean = Object.fromEntries(
    Object.entries(profile).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.trim() : [...value],
    ]),
  );
  await AsyncStorage.setItem(profileKey, JSON.stringify(clean));
  if (snapshot.deleted) await AsyncStorage.multiRemove([deletedKey, deletedEmailKey]);
  snapshot = { ...snapshot, deleted: false, demo: false };
  listeners.forEach((listener) => listener());
}

/**
 * Saves the profile and PIN credential, restoring the old credential if saving fails.
 *
 * Registration requires a PIN; editing profile details does not replace it.
 *
 * @param profile - Completed profile fields to validate and save.
 * @param pin - Exactly four digits for this device’s sign-in credential.
 * @throws If validation or saving fails. The previous credential is restored if profile saving fails.
 */
export async function registerProfile(profile: Profile, pin: string) {
  if (!isValidPin(pin) || Object.keys(profileErrors(profile)).length)
    throw new Error('Complete your profile and four-digit PIN.');
  const credential = await createPinCredential(profile.email, pin);
  // Save the credential first, but remember the old value in case profile saving fails.
  const previous = await readPinCredential();
  await writePinCredential(credential);
  try {
    await saveProfile(profile);
    await AsyncStorage.removeItem('mpowered:pin-attempts');
  } catch (error) {
    await writePinCredential(previous);
    throw error;
  }
}

// Remount navigation after deletion to discard drafts, route parameters, recordings,
// and component-local state. The marker also prevents demo data returning on reload.
let snapshot = { ready: false, deleted: false, revision: 0, demo: true };
const cleanupHandlers = new Map<string, () => void>();

/**
 * Registers a feature cleanup action so account deletion can clear its local data.
 *
 * Features retain ownership of their stores and register only their cleanup behavior.
 *
 * @param key - Stable feature name; registering the same key replaces its previous handler.
 * @param cleanup - Clears that feature’s in-memory data. May run immediately after registration.
 */
export function registerAccountCleanup(key: string, cleanup: () => void) {
  cleanupHandlers.set(key, cleanup);
  // A lazily loaded feature must not introduce sample data into an existing account.
  if (snapshot.ready && !snapshot.demo) cleanup();
}

const listeners = new Set<() => void>();

/** Returns the current account loading and deletion status. */
export const getAccountSnapshot = () => snapshot;

/** Registers a listener and returns a function that removes it. */
export const subscribeAccount = (listener: () => void) => {
  // React's external-store hook uses this subscription to refresh account screens.
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Checks whether the email matches the account deleted on this device. */
export async function wasLocalAccountDeleted(email: string) {
  const deletedEmail = await AsyncStorage.getItem(deletedEmailKey);
  return deletedEmail === email.trim().toLowerCase();
}

/** Allows a different account to enter after checking the local deletion marker. */
export async function completeDifferentAccountSignIn(email: string) {
  // Recheck after verification so a deletion that happened during sign-in cannot be bypassed.
  if (await wasLocalAccountDeleted(email)) return false;
  await AsyncStorage.removeItem(deletedKey);
  snapshot = { ...snapshot, ready: true, deleted: false, demo: true };
  listeners.forEach((listener) => listener());
  return true;
}

/** Clears shared assessment data and calls the registered feature cleanup actions. */
const clearSession = () => {
  // Clear data held by modules as well as data persisted by AsyncStorage.
  resetAssessmentSession();
  cleanupHandlers.forEach((cleanup) => cleanup());
};

/** Restores account data and finishes any interrupted deletion before navigation starts. */
export async function initializeAccount() {
  // Finish setup and restore history before the app chooses its first route.
  const deleted = (await AsyncStorage.getItem(deletedKey)) === 'true';
  // If the previous deletion was interrupted, finish removing remaining data
  // before any account screen can mount.
  if (deleted) {
    await writePinCredential(null);
    await removeAccountKeys();
  }
  const demo = !deleted && !(await AsyncStorage.getItem(profileKey));
  if (!demo) clearSession();
  await loadPainHistory();
  const latestPain = getPainHistory().at(-1);
  // Restore the latest pain answers so profile summaries survive a full restart.
  if (latestPain)
    markAssessmentCompleted('pain', latestPain.answers, new Date(latestPain.completedAt));
  snapshot = { ...snapshot, ready: true, deleted, demo };
  listeners.forEach((listener) => listener());
}

/** Removes this app’s stored data while keeping its deletion markers. */
async function removeAccountKeys() {
  // The shared prefix lets deletion find current and future MPowered data keys.
  const keys = (await AsyncStorage.getAllKeys()).filter(
    (key) => key.startsWith('mpowered:') && key !== deletedKey && key !== deletedEmailKey,
  );
  await AsyncStorage.multiRemove(keys);
}

/**
 * Marks the account as deleted, clears its local data, and resets navigation state.
 *
 * @returns Resolves after local credentials, history, and registered feature data have been cleared.
 * @throws If a storage operation fails; the deletion marker allows startup to retry cleanup.
 */
export async function deleteLocalAccount() {
  // Only this app's keys are removed; other apps using the same storage are untouched.
  // Write the deletion marker first so partially failed cleanup can safely be retried.
  const profile = await getProfile();
  await AsyncStorage.setItem(deletedKey, 'true');
  if (profile) await AsyncStorage.setItem(deletedEmailKey, profile.email.trim().toLowerCase());
  await writePinCredential(null);
  await finishPainHistoryWrites();
  await removeAccountKeys();
  clearSession();
  snapshot = { ready: true, deleted: true, revision: snapshot.revision + 1, demo: false };
  // Increasing revision remounts navigation and discards unsaved screen-local drafts.
  listeners.forEach((listener) => listener());
}
