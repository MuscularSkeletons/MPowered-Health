/**
 * Prescription CRUD with Supabase, where RLS makes sure every call is by the user.
 *
 * Every function throws on failure. Returning an empty list instead would make a failed load look
 * like "Prescription list is empty", which is unsafe for a medication list.
 */
import { supabase } from '@/lib/supabase/client';
import {
  draftToInsert,
  draftToUpdate,
  rowToPrescription,
  type PrescriptionDraft,
  type PrescriptionItem,
  type PrescriptionRow,
} from './prescriptions.mapper';

/** Error messages carry only the error code, never prescription details. */
const failure = (action: string, code?: string) => new Error(`Could not ${action} (${code ?? 'unknown'}).`);

/** Oldest first, matching how the list screen appends new prescriptions. */
export async function listPrescriptions(userId: string): Promise<PrescriptionItem[]> {
  const { data, error } = await supabase
    .from('prescription')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw failure('load prescriptions', error.code);
  return ((data ?? []) as PrescriptionRow[]).map(rowToPrescription);
}

export async function createPrescription(userId: string, draft: PrescriptionDraft): Promise<PrescriptionItem> {
  const { data, error } = await supabase
    .from('prescription')
    .insert(draftToInsert(draft, userId))
    .select()
    .single();
  if (error) throw failure('save the prescription', error.code);
  return rowToPrescription(data as PrescriptionRow);
}

/** Fails (rather than silently doing nothing) if the row no longer exists or isn't the users. */
export async function updatePrescription(id: string, draft: PrescriptionDraft): Promise<PrescriptionItem> {
  const { data, error } = await supabase
    .from('prescription')
    .update(draftToUpdate(draft))
    .eq('prescription_id', id)
    .select()
    .single();
  if (error) throw failure('save the prescription', error.code);
  return rowToPrescription(data as PrescriptionRow);
}

export async function deletePrescription(id: string): Promise<void> {
  const { error } = await supabase.from('prescription').delete().eq('prescription_id', id);
  if (error) throw failure('remove the prescription', error.code);
}
