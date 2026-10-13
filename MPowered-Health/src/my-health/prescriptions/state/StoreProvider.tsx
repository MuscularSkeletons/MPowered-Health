import { useAuth } from '@/context/authcontext';
import {
  createPrescription,
  deletePrescription,
  listPrescriptions,
  updatePrescription,
} from '@/services/prescriptions.services';
import { isDuplicate } from '@/my-health/prescriptions/state/prescriptions.mapper';
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { medicationReady, type Medication, type MedicationDraft } from './model';

// The session boundary loads the list before any screen mounts, so the list is correct on the first
// render and a failed load shows the boundary's retry screen instead of "Prescription list is empty".
let preloaded: { userId: string; list: Medication[] } | null = null;
// Bumped on every clear, so a request that started for a previous account cannot land late and
// overwrite the list loaded for the current one.
let generation = 0;

/** Loads this account's prescriptions. Called by the session boundary - throws if the request fails. */
export async function loadPrescriptions(userId: string) {
  const requestGeneration = generation;
  const list = await listPrescriptions(userId);
  if (requestGeneration !== generation) return;
  preloaded = { userId, list };
}

/** Forgets the loaded list when the account changes or the boundary unmounts. */
export function clearPrescriptions() {
  generation += 1;
  preloaded = null;
}

/** Keeps the prescription list and its update actions, saving every change to supabase. */
function useMedicationStore() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [list, setList] = useState<Medication[]>(() =>
    preloaded && preloaded.userId === userId ? preloaded.list : [],
  );
  const [error, setError] = useState('');
  // Blocks a second save while one is running, so a double tap cannot create two prescriptions.
  const saving = useRef(false);

  /**
   * Adds or updates a prescription. True only after Supabase accepts the change.
   * The list changes only on success, so a failed save never looks saved!
   */
  const save = async (draft: MedicationDraft, id?: string) => {
    if (!medicationReady(draft) || !userId || saving.current) return false;
    saving.current = true;
    setError('');
    try {
      const saved = id ? await updatePrescription(id, draft) : await createPrescription(userId, draft);
      setList((items) => (id ? items.map((item) => (item.id === id ? saved : item)) : [...items, saved]));
      return true;
    } catch {
      setError('The prescription could not be saved. Please try again.');
      return false;
    } finally {
      saving.current = false;
    }
  };

  /** Removes the prescription from Supabase, then from the list. */
  const remove = async (id: string) => {
    setError('');
    try {
      await deletePrescription(id);
      setList((items) => items.filter((item) => item.id !== id));
      return true;
    } catch {
      setError('The prescription could not be removed. Please try again.');
      return false;
    }
  };

  /** True when another prescription already has this name, strength and unit. */
  const duplicateOf = (draft: MedicationDraft, id?: string) => isDuplicate(draft, list, id);

  return { list, save, remove, error, duplicateOf };
}

const Context = createContext<ReturnType<typeof useMedicationStore> | null>(null);

/** Shares the prescription list across its list and editor screens. */
export function MedicationProvider({ children }: { children: ReactNode }) {
  const value = useMedicationStore();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

/** Reads the prescription list and available update actions. */
export function useMedications() {
  const value = useContext(Context);
  if (!value) throw new Error('MedicationProvider is required');
  return value;
}
