/**
 * Maps between the prescription form and the Prescription table.
 */

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