import AsyncStorage from '@react-native-async-storage/async-storage';
import { validAnswer } from '@/utils/workflow-validation';
import { sexOptions, diagnosisOptions, painConditions } from './profile-options';
import { resetAssessmentSession } from './assessment-session';
import { resetAppointments } from './appointments';

export type Profile = {
  email: string;
  name: string;
  sex: string;
  birthYear: string;
  diagnosis: string;
  conditions: string[];
  otherConditions: string;
};
export const emptyProfile: Profile = {
  email: '',
  name: '',
  sex: '',
  birthYear: '',
  diagnosis: '',
  conditions: [],
  otherConditions: '',
};
const profileKey = 'mpowered:profile';
const deletedKey = 'mpowered:account-deleted';

// The editor and onboarding use the same validation and option lists.
export function profileErrors(profile: Profile) {
  const errors: Partial<Record<keyof Profile, string>> = {};
  if (!validAnswer('Your email address', profile.email))
    errors.email = 'Enter a valid email address.';
  if (!profile.name.trim()) errors.name = 'Your name is required.';
  if (!sexOptions.includes(profile.sex)) errors.sex = 'Select an answer.';
  if (profile.birthYear.trim() && !validAnswer('Year of birth', profile.birthYear))
    errors.birthYear = 'Enter a valid four-digit birth year, or leave blank.';
  if (!diagnosisOptions.includes(profile.diagnosis)) errors.diagnosis = 'Select an answer.';
  if (profile.conditions.some((condition) => !painConditions.includes(condition)))
    errors.conditions = 'Select conditions from the list.';
  return errors;
}

export function profileFromAnswers(
  fields: Record<string, string>,
  choices: Record<number, string[]>,
): Profile {
  return {
    email: fields['0-Your email address'] ?? '',
    name: fields['3-Type your name'] ?? '',
    sex: choices[4]?.[0] ?? '',
    birthYear: fields['5-Year of birth'] ?? '',
    diagnosis: choices[6]?.[0] ?? '',
    conditions: choices[7] ?? [],
    otherConditions: fields['8-Other conditions'] ?? '',
  };
}

export async function getProfile(): Promise<Profile | null> {
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

export async function saveProfile(profile: Profile) {
  if (Object.keys(profileErrors(profile)).length) throw new Error('Invalid profile answers');
  const clean = Object.fromEntries(
    Object.entries(profile).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.trim() : [...value],
    ]),
  );
  await AsyncStorage.setItem(profileKey, JSON.stringify(clean));
  if (snapshot.deleted) await AsyncStorage.removeItem(deletedKey);
  snapshot = { ...snapshot, deleted: false, demo: false };
  listeners.forEach((listener) => listener());
}

// Remount navigation after deletion to discard drafts, route parameters, recordings,
// and component-local state. The marker also prevents demo data returning on reload.
let snapshot = { ready: false, deleted: false, revision: 0, demo: true };
const listeners = new Set<() => void>();
export const getAccountSnapshot = () => snapshot;
export const subscribeAccount = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const clearSession = () => {
  resetAssessmentSession();
  resetAppointments();
};
export async function initializeAccount() {
  const deleted = (await AsyncStorage.getItem(deletedKey)) === 'true';
  // If the previous deletion was interrupted, finish removing remaining data
  // before any account screen can mount.
  if (deleted) await removeAccountKeys();
  const demo = !deleted && !(await AsyncStorage.getItem(profileKey));
  if (!demo) clearSession();
  snapshot = { ...snapshot, ready: true, deleted, demo };
  listeners.forEach((listener) => listener());
}

async function removeAccountKeys() {
  const keys = (await AsyncStorage.getAllKeys()).filter(
    (key) => key.startsWith('mpowered:') && key !== deletedKey,
  );
  await AsyncStorage.multiRemove(keys);
}

export async function deleteLocalAccount() {
  // Only this app's keys are removed; other apps using the same storage are untouched.
  // Write the deletion marker first so partially failed cleanup can safely be retried.
  await AsyncStorage.setItem(deletedKey, 'true');
  await removeAccountKeys();
  clearSession();
  snapshot = { ready: true, deleted: true, revision: snapshot.revision + 1, demo: false };
  listeners.forEach((listener) => listener());
}
