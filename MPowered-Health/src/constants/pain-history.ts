import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AssessmentAnswers } from './assessment-session';

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
let writes: Promise<unknown> = Promise.resolve();
const clone = (record: PainAssessmentRecord): PainAssessmentRecord => ({
  ...record,
  areas: [...record.areas],
  answers: Object.fromEntries(
    Object.entries(record.answers).map(([key, values]) => [key, [...values]]),
  ),
});

export function painAreaKey(areas: string[]) {
  return JSON.stringify([...new Set(areas.map((area) => area.trim()).filter(Boolean))].sort());
}

function createRecord(
  answers: AssessmentAnswers,
  completedAt: string,
  id: string,
): PainAssessmentRecord {
  const areas: string[] = JSON.parse(painAreaKey(answers[0] ?? []));
  if (!areas.length || !Number.isFinite(Date.parse(completedAt)))
    throw new Error('Missing pain areas or assessment date.');
  const score = (index: number) => {
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

export async function loadPainHistory() {
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

export async function savePainAssessment(answers: AssessmentAnswers, now = new Date()) {
  // Snapshot answers before the asynchronous save so later edits cannot change history.
  const record = createRecord(
    answers,
    now.toISOString(),
    `${now.getTime()}-${Math.random().toString(36).slice(2)}`,
  );
  const write = writes
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

export async function finishPainHistoryWrites() {
  await writes.catch(() => undefined);
}
export function clearPainHistoryMemory() {
  records = [];
}
export function getPainHistory() {
  return records.map(clone);
}

export function groupPainHistory(history: PainAssessmentRecord[]): PainAreaGroup[] {
  const groups = new Map<string, PainAreaGroup>();
  for (const record of [...history].sort((a, b) => a.completedAt.localeCompare(b.completedAt))) {
    const key = painAreaKey(record.areas);
    if (!groups.has(key)) groups.set(key, { key, label: JSON.parse(key).join(', '), records: [] });
    groups.get(key)!.records.push(clone(record));
  }
  return [...groups.values()];
}

export function painMetricValue(record: PainAssessmentRecord, metric: PainMetric) {
  return metric === 'Worst' ? record.worst : metric === 'Mildest' ? record.mildest : record.average;
}

export function painRecordDate(record: PainAssessmentRecord, compact = false) {
  const date = new Date(record.completedAt);
  return compact
    ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
    : date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}
