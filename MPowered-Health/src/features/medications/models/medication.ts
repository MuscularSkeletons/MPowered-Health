export interface MedicationDraft {
  name: string;
  strength: string;
  unit: string;
  form: string;
  repeat: string;
}
export interface Medication extends MedicationDraft {
  id: string;
  scheduleLabel?: string;
}
export const emptyMedication = (): MedicationDraft => ({
  name: '',
  strength: '',
  unit: 'mg',
  form: 'Tablet',
  repeat: 'day',
});
export const validStrength = (value: string) =>
  /^\d+(\.\d+)?$/.test(value.trim()) && Number(value) > 0 && Number.isFinite(Number(value));
export const medicationReady = (draft: MedicationDraft) =>
  !!draft.name.trim() &&
  validStrength(draft.strength) &&
  !!draft.unit &&
  !!draft.form &&
  !!draft.repeat;
export const medicationLabel = (medication: Medication) =>
  `${medication.name} ${medication.strength} ${medication.unit} — ${medication.scheduleLabel ?? `Every ${medication.repeat}`}`;
export function saveMedication(
  list: Medication[],
  draft: MedicationDraft,
  id: string,
): Medication[] {
  if (!medicationReady(draft)) return list;
  const medication: Medication = { ...draft, name: draft.name.trim(), id };
  return list.some((item) => item.id === id)
    ? list.map((item) => (item.id === id ? medication : item))
    : [...list, medication];
}
