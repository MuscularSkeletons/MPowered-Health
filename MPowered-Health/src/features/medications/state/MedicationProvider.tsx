import { getAccountSnapshot } from '@/features/account/services/account';
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { demoMedications } from '../models/demo-medications';
import { medicationReady, saveMedication, type MedicationDraft } from '../models/medication';
function useMedicationStore() {
  const [list, setList] = useState(() => (getAccountSnapshot().demo ? demoMedications : []));
  const sequence = useRef(0);
  const save = (draft: MedicationDraft, id?: string) => {
    if (!medicationReady(draft)) return false;
    const key = id ?? `medication-${Date.now()}-${sequence.current++}`;
    setList((items) => saveMedication(items, draft, key));
    return true;
  };
  const remove = (id: string) => setList((items) => items.filter((item) => item.id !== id));
  return { list, save, remove };
}
const Context = createContext<ReturnType<typeof useMedicationStore> | null>(null);
export function MedicationProvider({ children }: { children: ReactNode }) {
  const value = useMedicationStore();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMedications() {
  const value = useContext(Context);
  if (!value) throw new Error('MedicationProvider is required');
  return value;
}
