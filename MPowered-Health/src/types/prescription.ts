/** Defines prescription data, required-field checks, and list update rules. */
export interface MedicationDraft {
  name: string;
  strength: string;
  unit: string;
  form: string;
  frequency: string;
  repeat: string;
}
export interface Medication extends MedicationDraft {
  id: string;
}

/** Creates the starting values for a new prescription. */
export const emptyMedication = (): MedicationDraft => ({
  name: '',
  strength: '',
  unit: 'mg',
  form: 'Tablet',
  frequency: 'day',
  repeat: '',
});

/** Checks that a number is a finite positive number. */
export const validNumber = (value: string) =>
  /^\d+(\.\d+)?$/.test(value.trim()) && Number(value) > 0 && Number.isFinite(Number(value));

/** Checks whether the required prescription fields are complete. */
export const medicationReady = (draft: MedicationDraft) =>
  !!draft.name.trim() &&
  validNumber(draft.strength) &&
  !!draft.unit &&
  !!draft.form &&
  !!draft.frequency &&
  validNumber(draft.repeat);

function mapSchedule(repeat: string, frequency: string): string {
  let number = repeat + ' times';
  let freq = 'daily';

  // special cases for numbers
  if (repeat === '1') {
    number = 'Once';
  } else if (repeat === '2') {
    number = 'Twice';
  }

  // map frequency
  if (frequency === 'hour') {
    freq = 'hourly';
  } else if (frequency === 'day') {
    freq = 'daily';
  } else if (frequency === 'week') {
    freq = 'weekly';
  } else if (frequency ==='month') {
    freq = 'monthly';
  }

  return number + ' ' + freq;
}

/** Formats the medicine name, strength, and schedule for display. */
export const medicationLabel = (medication: Medication) =>
  `${medication.name} ${medication.strength} ${medication.unit} — ${mapSchedule(medication.repeat, medication.frequency)}`;

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
