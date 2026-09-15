/** Keeps the prescription list and its update actions in memory. */
import { getAccountSnapshot } from '@/shared/account/repository';
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { demoMedications } from './sample-data';
import { medicationReady, saveMedication, type MedicationDraft } from './model';

/** Keeps the prescription list and its update actions in memory. */
function useMedicationStore() {
  const [list, setList] = useState(() => (getAccountSnapshot().demo ? demoMedications : []));
  const sequence = useRef(0);

  /** Adds or updates a prescription in the current list. */
  const save = (draft: MedicationDraft, id?: string) => {
    if (!medicationReady(draft)) return false;
    const key = id ?? `medication-${Date.now()}-${sequence.current++}`;
    setList((items) => saveMedication(items, draft, key));
    return true;
  };

  /** Removes the prescription with the selected ID. */
  const remove = (id: string) => setList((items) => items.filter((item) => item.id !== id));

  return { list, save, remove };
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
