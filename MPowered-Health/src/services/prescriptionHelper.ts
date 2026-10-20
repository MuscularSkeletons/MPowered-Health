import { type PrescriptionDraft, type PrescriptionItem } from '@/types/prescriptions';

/** Creates the starting values for a new prescription. */
export const emptyPrescription = (): PrescriptionDraft => ({
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
export const prescriptionReady = (draft: PrescriptionDraft) =>
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

/** Formats the prescription name, strength, and schedule for display. */
export const prescriptionLabel = (prescription: PrescriptionItem) =>
  `${prescription.name} ${prescription.strength} ${prescription.unit} — ${mapSchedule(prescription.repeat, prescription.frequency)}`;

/**
 * Adds a prescription or replaces the entry with the same ID.
 *
 * @param list - Existing prescription entries.
 * @param draft - Entered prescription values.
 * @param id - Identity to add or replace.
 * @returns The updated list, or the original list if the draft is invalid.
 */
export function savePresciption(
  list: PrescriptionItem[],
  draft: PrescriptionDraft,
  id: string,
): PrescriptionItem[] {
  if (!prescriptionReady(draft)) return list;
  const prescription: PrescriptionItem = { ...draft, name: draft.name.trim(), id };
  return list.some((item) => item.id === id)
    ? list.map((item) => (item.id === id ? prescription : item))
    : [...list, prescription];
}
