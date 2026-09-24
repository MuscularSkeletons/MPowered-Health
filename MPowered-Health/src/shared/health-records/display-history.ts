import { getPainHistory } from './pain-history';
import { getDemoPainHistory } from './demo-history';

// Backend handoff: remove this fallback once the history loader reads real assessments.
// Keep demo rows outside the writable store so saving a real result never persists fixtures.
export const DEMO_HISTORY_ENABLED = true;

export function getDisplayPainHistory() {
  const records = getPainHistory();
  return records.length || !DEMO_HISTORY_ENABLED ? records : getDemoPainHistory();
}
