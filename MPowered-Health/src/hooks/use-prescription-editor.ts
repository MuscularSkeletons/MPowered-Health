import { useState } from 'react';
import {
  emptyMedication,
  medicationReady,
  validNumber,
  type MedicationDraft,
} from '@/types/prescription';
import { useMedications } from '@/context/prescriptions-context';

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
          frequency: existing.frequency,
          repeat: existing.repeat,
        }
      : emptyMedication(),
  );

  /** Updates one prescription field without changing the others. */
  const change = (field: keyof MedicationDraft, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const duplicate = store.duplicateOf(draft, id);

  return {
    draft,
    change,
    validName: !!draft.name.trim(),
    validStrength: validNumber(draft.strength),
    validRepeat: validNumber(draft.repeat),
    duplicate,
    ready: medicationReady(draft) && !duplicate,
    save: () => store.save(draft, id),
    // A stale edit link must be reported instead of silently creating a replacement.
    missing: !!id && !existing,
  };
}
