/** Defines prescription data, required-field checks, and list update rules. */
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

/** Creates the starting values for a new prescription. */
export const emptyMedication = (): MedicationDraft => ({
  name: '',
  strength: '',
  unit: 'mg',
  form: 'Tablet',
  repeat: 'day',
});

/** Checks that a medicine strength is a finite positive number. */
export const validStrength = (value: string) =>
  /^\d+(\.\d+)?$/.test(value.trim()) && Number(value) > 0 && Number.isFinite(Number(value));

/** Checks whether the required prescription fields are complete. */
export const medicationReady = (draft: MedicationDraft) =>
  !!draft.name.trim() &&
  validStrength(draft.strength) &&
  !!draft.unit &&
  !!draft.form &&
  !!draft.repeat;

/** Formats the medicine name, strength, and schedule for display. */
export const medicationLabel = (medication: Medication) =>
  `${medication.name} ${medication.strength} ${medication.unit} — ${medication.scheduleLabel ?? `Every ${medication.repeat}`}`;

/**
 * Adds a prescription or replaces the entry with the same ID.
 *
 * @param list - Existing prescription entries.
 * @param draft - Entered prescription values.
 * @param id - Identity to add or replace.
 * @returns The updated list, or the original list if the draft is invalid.
 */
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
