import { useState } from 'react';
import {
  emptyMedication,
  medicationReady,
  validStrength,
  type MedicationDraft,
} from '../state/model';
import { useMedications } from '../state/StoreProvider';
export function useMedicationEditor(id?: string) {
  const store = useMedications();
  const existing = store.list.find((item) => item.id === id);
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
  const change = (field: keyof MedicationDraft, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));
  return {
    draft,
    change,
    validName: !!draft.name.trim(),
    validStrength: validStrength(draft.strength),
    ready: medicationReady(draft),
    save: () => store.save(draft, id),
    missing: !!id && !existing,
  };
}
