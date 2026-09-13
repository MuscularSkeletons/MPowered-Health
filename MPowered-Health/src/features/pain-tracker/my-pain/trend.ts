import { getPainHistory, painRecordDate } from './history';
export type PainRecord = { date: string; score: number };
const painRecords: PainRecord[] = [
  // These sample points keep the dashboard useful before a person records real results.
  { date: '25/05', score: 5 },
  { date: '01/06', score: 5 },
  { date: '08/06', score: 7 },
];
export function getPainRecords() {
  // Real saved history replaces the starter chart as soon as a result exists.
  const saved = getPainHistory();
  if (saved.length)
    return saved.map((record) => ({ date: painRecordDate(record, true), score: record.average }));
  return [...painRecords];
}

export function resetPainTrend() {
  painRecords.splice(0);
}
