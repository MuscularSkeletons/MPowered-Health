/** Loads, saves, and groups dated pain assessments for screens and reports. */
// This file saves and loads the user's dated pain assessment history.
import type { AssessmentAnswers } from '@/shared/health-records/assessment-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PainAssessmentRecord = {
  id: string;
  completedAt: string;
  areas: string[];
  current: number;
  mildest: number;
  worst: number;
  average: number;
  answers: AssessmentAnswers;
};
export type PainMetric = 'Average' | 'Worst' | 'Mildest';
export type PainAreaGroup = { key: string; label: string; records: PainAssessmentRecord[] };
const storageKey = 'mpowered:pain-history:v1';
let records: PainAssessmentRecord[] = [];
// Chain disk writes in submission order so two quick saves cannot overwrite each other.
let writes: Promise<unknown> = Promise.resolve();

// Every public read and write crosses this copy boundary to protect saved history.
/** Copies a record so callers cannot change the stored object through a shared reference. */
const clone = (record: PainAssessmentRecord): PainAssessmentRecord => ({
  ...record,
  areas: [...record.areas],
  answers: Object.fromEntries(
    Object.entries(record.answers).map(([key, values]) => [key, [...values]]),
  ),
});

/** Builds a consistent key for a set of pain areas. */
export function painAreaKey(areas: string[]) {
  // Trim, remove duplicates, and sort so "Back, Knee" always has one stable key.
  return JSON.stringify([...new Set(areas.map((area) => area.trim()).filter(Boolean))].sort());
}

/** Builds a dated pain-history record from assessment answers. */
function createRecord(
  answers: AssessmentAnswers,
  completedAt: string,
  id: string,
): PainAssessmentRecord {
  // Step zero holds selected body areas; the intensity questions start at step two.
  const areas: string[] = JSON.parse(painAreaKey(answers[0] ?? []));
  if (!areas.length || !Number.isFinite(Date.parse(completedAt)))
    throw new Error('Missing pain areas or assessment date.');

  /** Reads a numeric pain score from the answers. */
  const score = (index: number) => {
    // Reject missing, decimal, and out-of-range values before anything reaches storage.
    const value = answers[index]?.[0];
    if (
      value === undefined ||
      value.trim() === '' ||
      !Number.isInteger(Number(value)) ||
      Number(value) < 0 ||
      Number(value) > 10
    ) {
      throw new Error('Complete all pain intensity questions before saving.');
    }
    return Number(value);
  };

  return clone({
    id,
    completedAt,
    areas,
    current: score(2),
    mildest: score(3),
    worst: score(4),
    average: score(5),
    answers,
  });
}

/**
 * Loads and validates saved pain history into memory.
 *
 * @throws If saved JSON is malformed, a record is invalid, or storage cannot be read.
 */
export async function loadPainHistory() {
  // Rebuild each stored entry through createRecord so old or damaged data is validated.
  const raw = await AsyncStorage.getItem(storageKey);
  if (!raw) {
    records = [];
    return;
  }
  const saved: unknown = JSON.parse(raw);
  if (!Array.isArray(saved)) throw new Error('Unable to read pain history.');
  records = saved
    .map((record) => {
      if (
        !record ||
        typeof record.id !== 'string' ||
        typeof record.completedAt !== 'string' ||
        !record.answers ||
        typeof record.answers !== 'object' ||
        Object.values(record.answers).some(
          (values) => !Array.isArray(values) || values.some((value) => typeof value !== 'string'),
        )
      ) {
        throw new Error('Unable to read pain history.');
      }
      return createRecord(record.answers, record.completedAt, record.id);
    })
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
}

/**
 * Adds a completed pain assessment and saves the updated history.
 *
 * @param answers - Answers keyed by question index; pain areas and all four intensity scores are required.
 * @param now - Completion time; defaults to the current time.
 * @returns A copy of the saved record after storage succeeds.
 * @throws If the answers are invalid or the storage write fails.
 */
export async function savePainAssessment(answers: AssessmentAnswers, now = new Date()) {
  // Snapshot answers before the asynchronous save so later edits cannot change history.
  const record = createRecord(
    answers,
    now.toISOString(),
    `${now.getTime()}-${Math.random().toString(36).slice(2)}`,
  );
  const write = writes
    // A previous disk failure must not permanently block the next save attempt.
    .catch(() => undefined)
    .then(async () => {
      const updated = [...records, record].sort((a, b) =>
        a.completedAt.localeCompare(b.completedAt),
      );
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
      records = updated;
      return clone(record);
    });
  writes = write;
  return write;
}

/** Waits until pending pain-history saves have finished. */
export async function finishPainHistoryWrites() {
  // Account deletion waits for any active save before clearing persistent data.
  await writes.catch(() => undefined);
}

/** Clears the pain records currently held in memory. */
export function clearPainHistoryMemory() {
  // Clear the session copy after account deletion or an explicit reset.
  records = [];
}

/**
 * Returns copies of the current pain-history records.
 *
 * @returns New record and answer objects that callers can sort or edit without changing stored history.
 */
export function getPainHistory() {
  // Screens receive copies and can sort or filter them safely.
  return records.map(clone);
}

/** Groups pain records by the areas where pain was reported. */
export function groupPainHistory(history: PainAssessmentRecord[]): PainAreaGroup[] {
  // Group weeks by their complete area combination, in chronological order.
  const groups = new Map<string, PainAreaGroup>();
  for (const record of [...history].sort((a, b) => a.completedAt.localeCompare(b.completedAt))) {
    const key = painAreaKey(record.areas);
    if (!groups.has(key)) groups.set(key, { key, label: JSON.parse(key).join(', '), records: [] });
    groups.get(key)!.records.push(clone(record));
  }
  return [...groups.values()];
}

/** Reads the requested pain score from a history record. */
export function painMetricValue(record: PainAssessmentRecord, metric: PainMetric) {
  // Keep chart metric selection in one place for the screen and PDF report.
  return metric === 'Worst' ? record.worst : metric === 'Mildest' ? record.mildest : record.average;
}

/** Formats the completion date for display. */
export function painRecordDate(record: PainAssessmentRecord, compact = false) {
  // Charts use DD/MM; lists and reports use a readable Australian date.
  const date = new Date(record.completedAt);
  return compact
    ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
    : date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}
