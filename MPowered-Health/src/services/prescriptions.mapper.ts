/**
 * Maps between the prescription form and the Prescription table.
 * Pure functions so they can be unit tested!!
 */

/** Same shape as the form's MedicationDraft (declared here so services do not import from UI folders). */
export interface PrescriptionDraft {
  name: string;
  strength: string;
  unit: string;
  form: string;
  frequency: string;
  repeat: string;
}
export interface PrescriptionItem extends PrescriptionDraft {
  id: string;
}

export interface PrescriptionRow {
  prescription_id: string;
  medicine_name: string;
  strength: number;
  strength_unit: string;
  form: string;
  frequency: string;
  number_of_repeat: number;
}

export function rowToPrescription(row: PrescriptionRow): PrescriptionItem {
  return {
    id: row.prescription_id,
    name: row.medicine_name,
    strength: String(row.strength),
    unit: row.strength_unit,
    form: row.form,
    frequency: row.frequency,
    repeat: String(row.number_of_repeat),
  };
}

/** Fields shared by insert. */
export function editableFields(draft: PrescriptionDraft) {
  return {
    medicine_name: draft.name.trim(),
    strength: Number(draft.strength),
    strength_unit: draft.unit,
    form: draft.form,
    frequency: draft.frequency,
    number_of_repeat: Number(draft.repeat),
  };
}

export function draftToInsert(draft: PrescriptionDraft, userId: string) {
  return {
    ...editableFields(draft),
    user_id: userId,
  };
}

/** True when another prescription has the same name (with case not mattering), strength and unit. */
export function isDuplicate(
  draft: PrescriptionDraft,
  list: PrescriptionItem[],
  excludeId?: string,
): boolean {
  const name = draft.name.trim().toLowerCase();
  return list.some(
    (item) =>
      item.id !== excludeId &&
      item.name.trim().toLowerCase() === name &&
      Number(item.strength) === Number(draft.strength) &&
      item.unit === draft.unit,
  );
}
