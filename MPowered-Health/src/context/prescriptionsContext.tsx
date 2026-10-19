import { useAuth } from '@/context/authcontext';
import {
  createPrescription,
  deletePrescription,
  listPrescriptions,
  updatePrescription,
} from '@/services/prescriptions.services';
import { isDuplicate } from '@/services/prescriptions.mapper';
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { medicationReady, type Medication, type MedicationDraft } from '@/types/prescription';

// The session boundary loads the list before any screen mounts, so the list is correct on the first
// render and a failed load is recorded here instead of thrown so only the prescriptions screen reports it
// (with a retry), and the rest of My Health stays available.
let preloaded: { userId: string; list: Medication[]; failed: boolean } | null = null;
// Bumped on every clear, so a request that started for a previous account cannot land late and
// overwrite the list loaded for the current one.
let generation = 0;

/** Loads this account's prescriptions. Never throws - a failure is recorded for the prescriptions screen. */
export async function loadPrescriptions(userId: string) {
  const requestGeneration = generation;
  let list: Medication[] = [];
  let failed = false;
  try {
    list = await listPrescriptions(userId);
  } catch {
    failed = true;
  }
  if (requestGeneration !== generation) return;
  preloaded = { userId, list, failed };
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

  // True when the first load failed. The list screen shows an error and a retry instead of
  // "Prescription list is empty", which would be wrong for a list that just didn't load.
  const [loadFailed, setLoadFailed] = useState(
    () => !!preloaded && preloaded.userId === userId && preloaded.failed,
  );
  const [error, setError] = useState('');
  // Blocks a second save while one is running, so double tap can't make two prescriptions.
  const saving = useRef(false);

  /** Tries the load again after a failure. */
  const reload = async () => {
    if (!userId) return;
    try {
      setList(await listPrescriptions(userId));
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    }
  };

  /**
   * Adds or updates a prescription. True only after Supabase accepts the change.
   * The list changes only on success, so a failed save never looks saved!
   */
  const save = async (draft: MedicationDraft, id?: string) => {
    if (!medicationReady(draft) || isDuplicate(draft, list, id) || !userId || saving.current) return false;
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

  /** True when another prescription already has this name, strength and unit */
  const duplicateOf = (draft: MedicationDraft, id?: string) => isDuplicate(draft, list, id);

  return { list, save, remove, error, duplicateOf, loadFailed, reload };
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
