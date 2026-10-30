import type { AssessmentAnswers } from "@/types/assessment";
import { fetchHealthSnapshot } from "@/hooks/useAssessments";
import type { HealthSnapshot } from "@/services/assessmentDataMapper";

/**
 * Gets pain data and health profile records for my health feature
*/

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
export type PainMetric = "Average" | "Worst" | "Mildest";
type PainAreaGroup = {
  key: string;
  label: string;
  records: PainAssessmentRecord[];
};

/** The id the session boundary passes when nobody is signed in */
const SIGNED_OUT = "signed-out";

let accountId: string | null = null;
let generation = 0;
let records: PainAssessmentRecord[] = [];
let latestAssessments: HealthSnapshot["latest"] = {};

/** Initialise the health records for a given account */
export function setHealthRecordsAccount(userId: string) {
  generation += 1;
  accountId = userId === SIGNED_OUT ? null : userId;
  records = [];
  latestAssessments = {};
}

/** Copies answers so callers cannot change the stored lists */
const cloneAnswers = (answers: AssessmentAnswers): AssessmentAnswers =>
  Object.fromEntries(
    Object.entries(answers).map(([key, values]) => [key, [...values]]),
  );

/**
 * Copies a record so callers cannot change the stored object through a shared reference
*/
const clone = (record: PainAssessmentRecord): PainAssessmentRecord => ({
  ...record,
  areas: [...record.areas],
  answers: cloneAnswers(record.answers),
});

/**
 * Loads the account's history (18 months worth) from database into memory.
 * @throws If the request fails, so session boundary can retry
 */
export async function loadHealthRecords() {
  const requestGeneration = generation;
  const userId = accountId;

  if (!userId) {
    records = [];
    return;
  }

  const snapshot = await fetchHealthSnapshot(userId);

  // If account changed while request was running, abort early and do not show records
  if (requestGeneration !== generation) return;

  records = snapshot.painRecords;
  latestAssessments = snapshot.latest;
}

/** Clears the current session's pain records */
export function clearHealthRecords() {
  // Clear the session copy after account deletion or reset
  records = [];
  latestAssessments = {};
}

/**
 * Returns copies of the current pain-history records, oldest first
 * @returns New record and answer objects that callers can sort or edit w/o changing loaded history
*/
export function getPainHistory() {
  // Screens receive copies and can sort or filter them safely!
  return records.map(clone);
}

/** Returns a safe copy of the newest answers recorded for each assessment category */
export function getLatestAssessments(): HealthSnapshot["latest"] {
  return Object.fromEntries(
    Object.entries(latestAssessments).map(([type, assessment]) => [
      type,
      assessment
        ? {
            ...assessment,
            answers: cloneAnswers(assessment.answers),
          }
        : assessment,
    ]),
  ) as HealthSnapshot["latest"];
}

/** Groups pain records by the areas where pain was reported */
export function groupPainHistory(
  history: PainAssessmentRecord[],
): PainAreaGroup[] {
  // Group weeks by their complete area combination, oldest first
  const groups = new Map<string, PainAreaGroup>();
  for (const record of [...history].sort((a, b) =>
    a.completedAt.localeCompare(b.completedAt),
  )) {
    // Extract out specific areas rather than area combination
    for (const area of record.areas) {
      const key = area.trim();
      if (!groups.has(key))
        groups.set(key, { key, label: key, records: [] });
      groups.get(key)!.records.push(clone(record));
    }
  }
  return [...groups.values()];
}

/** Reads the requested pain score from a history record */
export function painMetricValue(
  record: PainAssessmentRecord,
  metric: PainMetric,
) {
  // Keep chart metric selection in one place for the screen and PDF report
  return metric === "Worst"
    ? record.worst
    : metric === "Mildest"
      ? record.mildest
      : record.average;
}

/** Formats the completion date for display */
export function painRecordDate(record: PainAssessmentRecord, compact = false) {
  // Charts use DD/MM; lists and reports use a readable date
  const date = new Date(record.completedAt);
  return compact
    ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`
    : date.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}
