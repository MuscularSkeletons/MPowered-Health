import { useState } from 'react';
import {
  emptyMedication,
  medicationReady,
  validStrength,
  type MedicationDraft,
} from '../state/model';
import { useMedications } from '../state/StoreProvider';

/** Keeps the prescription form values and save actions together. */
export function useMedicationEditor(id?: string) {
  const store = useMedications();
  const existing = store.list.find((item) => item.id === id);
  // Edit a copy so typing does not change the visible prescription list before Save.
  const [draft, setDraft] = useState<MedicationDraft>(() =>
    existing
      ? {
          name: existing.name,
          strength: existing.strength,
          unit: existing.unit,
          form: existing.form,
          repeat: existing.repeat,
        }
      : emptyMedication(),
  );

  /** Updates one prescription field without changing the others. */
  const change = (field: keyof MedicationDraft, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  return {
    draft,
    change,
    validName: !!draft.name.trim(),
    validStrength: validStrength(draft.strength),
    ready: medicationReady(draft),
    save: () => store.save(draft, id),
    // A stale edit link must be reported instead of silently creating a replacement.
    missing: !!id && !existing,
  };
}
