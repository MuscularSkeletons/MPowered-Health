import { getPainHistory } from './pain-history';
import { getDemoPainHistory } from './demo-history';

// Demo rows were for UI development only, with real history now from Supabase, so a user with no
// assessments needs to see the empty states.
export const DEMO_HISTORY_ENABLED = false;

export function getDisplayPainHistory() {
  const records = getPainHistory();
  return records.length || !DEMO_HISTORY_ENABLED ? records : getDemoPainHistory();
}
