import type { AssessmentAnswers, AssessmentId } from "@/types/assessment";
import type { PainAssessmentRecord } from "@/services/healthDataHelper";

/**
 * Helpers that turn Supabase assessment tables into usable form for my health feature
*/

/** Assessments older than this are removed by the postgres cleanup script */
export const RETENTION_MONTHS = 18;
const DAYS_PER_WEEK = 7;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
/** The order assessment types are listed on the homepage */
const TYPE_ORDER: AssessmentId[] = [
  "pain",
  "movement",
  "personal",
  "social",
  "management",
];

// relevant data from assessment tables in Supabase
interface PainRow {
  current_pain: number;
  mildest_pain: number;
  worst_pain: number;
  average_pain: number;
  pain_location: string[];
  pain_characteristics: string[];
}
interface MovementRow {
  active_hour: string;
  general_impacts: string[] | null;
  walking_impact: string;
  lifting_impact: string;
  sitting_impact: string;
  standing_impact: string;
  movement_reflection: string | null;
}
interface PersonalCareRow {
  activities_impact: string[] | null;
  personal_care_impact: string;
  sleeping_impact: string;
  care_reflection: string | null;
}
interface SocialRow {
  social_life: string;
  travelling: string;
  mood_impact: number;
  relation_impact: number;
  enjoyment_impact: number;
  general_mood: string;
  mood_trigger: string | null;
}
interface ManagementRow {
  medicine_name: string[] | null;
  exercise_frequency: string;
  emotion_strategies: string | null;
}

/** PostgREST returns a child as an array, or as one object when foreign key is unique */
type OneOrMany<T> = T | T[] | null;

export interface AssessmentRow {
  assessment_id: string;
  date: string;
  pain_assessment: OneOrMany<PainRow>;
  movement_assessment: OneOrMany<MovementRow>;
  personal_care_assessment: OneOrMany<PersonalCareRow>;
  social_health_assessment: OneOrMany<SocialRow>;
  management_assessment: OneOrMany<ManagementRow>;
}

type LatestAssessment = {
  answers: AssessmentAnswers;
  completedAt: string;
};

/** 
 * One completed assessment inside a week
 * Pass 'answers' to the summary builder for 'type'
*/
interface WeekEntry {
  type: AssessmentId;
  assessmentId: string;
  completedAt: string;
  answers: AssessmentAnswers;
}

/** A Monday-to-Sunday week and the latest assessment of each type completed in it */
interface WeekGroup {
  weekStart: string;
  label: string;
  entries: WeekEntry[]; // in TYPE_ORDER - types with no assessment that week are absent
}

export interface HealthSnapshot {
  /** Oldest first, matching what groupPainHistory expects */
  painRecords: PainAssessmentRecord[];
  /** The newest answers for each assessment type that has any data */
  latest: Partial<Record<AssessmentId, LatestAssessment>>;
  /** Newest week first, for the History tab with week, then assessment type, then summary */
  weeks: WeekGroup[];
}

function first<T>(value: OneOrMany<T> | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
const one = (value: string | null | undefined): string[] =>
  value ? [value] : [];
const score = (value: number): string[] => [String(value)];

/** Convert database rows to the question-index format used by assessment summaries */
function painAnswers(row: PainRow): AssessmentAnswers {
  return {
    0: [...(row.pain_location ?? [])], // areas
    1: [...(row.pain_characteristics ?? [])],
    2: score(row.current_pain),
    3: score(row.mildest_pain),
    4: score(row.worst_pain),
    5: score(row.average_pain),
  };
}

function movementAnswers(row: MovementRow): AssessmentAnswers {
  return {
    0: one(row.active_hour),
    1: [...(row.general_impacts ?? [])],
    2: one(row.walking_impact),
    3: one(row.lifting_impact),
    4: one(row.sitting_impact),
    5: one(row.standing_impact),
    6: one(row.movement_reflection),
  };
}

function personalCareAnswers(row: PersonalCareRow): AssessmentAnswers {
  return {
    0: [...(row.activities_impact ?? [])],
    1: one(row.personal_care_impact),
    2: one(row.sleeping_impact),
    3: one(row.care_reflection),
  };
}

function socialAnswers(row: SocialRow): AssessmentAnswers {
  return {
    0: one(row.social_life),
    1: one(row.travelling),
    2: score(row.mood_impact),
    3: score(row.relation_impact),
    4: score(row.enjoyment_impact),
    5: one(row.general_mood),
    6: one(row.mood_trigger),
  };
}

function managementAnswers(row: ManagementRow): AssessmentAnswers {
  return {
    0: [...(row.medicine_name ?? [])],
    1: one(row.exercise_frequency),
    2: one(row.emotion_strategies),
  };
}

/** Trim, un-duplicate and sort so e.g. "Back, Knee"  and "Knee, Back" always forms one group */
const normalizeAreas = (pain: PainRow): string[] =>
  [
    ...new Set(
      (pain.pain_location ?? []).map((area) => area.trim()).filter(Boolean),
    ),
  ].sort();

/** Builds the record the charts, history and PDFs read, from an assessment and its pain row */
function toPainRecord(
  assessment: AssessmentRow,
  pain: PainRow,
): PainAssessmentRecord {
  const areas = normalizeAreas(pain);
  return {
    id: assessment.assessment_id,
    completedAt: new Date(assessment.date).toISOString(),
    areas,
    current: pain.current_pain,
    mildest: pain.mildest_pain,
    worst: pain.worst_pain,
    average: pain.average_pain,
    answers: { ...painAnswers(pain), 0: areas },
  };
}

/** The assessment types are on one row with their answers */
function answersByType(
  row: AssessmentRow,
): [AssessmentId, AssessmentAnswers][] {
  const found: [AssessmentId, AssessmentAnswers][] = [];
  const pain = first(row.pain_assessment);
  if (pain)
    found.push(["pain", { ...painAnswers(pain), 0: normalizeAreas(pain) }]);
  const movement = first(row.movement_assessment);
  if (movement) found.push(["movement", movementAnswers(movement)]);
  const personal = first(row.personal_care_assessment);
  if (personal) found.push(["personal", personalCareAnswers(personal)]);
  const social = first(row.social_health_assessment);
  if (social) found.push(["social", socialAnswers(social)]);
  const management = first(row.management_assessment);
  if (management) found.push(["management", managementAnswers(management)]);
  return found;
}

/** 
 * Turns the assessments (with their children) into the pain history 
 * plus the latest answers per type and week groups
*/
export function buildSnapshot(rows: AssessmentRow[]): HealthSnapshot {
  const newestFirst = [...rows].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  );
  const painRecords: PainAssessmentRecord[] = [];
  const latest: HealthSnapshot["latest"] = {};
  const weeks = new Map<string, WeekGroup>();

  for (const row of newestFirst) {
    const found = answersByType(row);
    if (!found.length) continue; // an assessment with no child rows has nothing to show

    const completedAt = new Date(row.date).toISOString();
    // Rows are newest first, so the first answers seen for a type are the latest
    const pain = first(row.pain_assessment);
    if (pain) painRecords.push(toPainRecord(row, pain));

    const start = weekStartOf(new Date(row.date));
    const key = isoDay(start);
    if (!weeks.has(key))
      weeks.set(key, { weekStart: key, label: weekLabel(start), entries: [] });
    const week = weeks.get(key)!;

    for (const [type, answers] of found) {
      // Rows are newest first, so the first answers seen for a type are the latest overall...
      if (!latest[type]) latest[type] = { answers, completedAt };
      // ...and the first seen within a week are that week's latest
      if (!week.entries.some((entry) => entry.type === type)) {
        week.entries.push({
          type,
          assessmentId: row.assessment_id,
          completedAt,
          answers,
        });
      }
    }
  }

  const weekList = [...weeks.values()].sort((a, b) =>
    b.weekStart.localeCompare(a.weekStart),
  );
  for (const week of weekList) {
    week.entries.sort(
      (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type),
    );
  }
  return { painRecords: painRecords.reverse(), latest, weeks: weekList };
}

/** The earliest date an assessment was completed and is still within the data retention period */
export function retentionCutoff(now = new Date()): Date {
  const cutoff = new Date(now);
  const day = cutoff.getDate();
  cutoff.setDate(1); // move to the 1st first, so changing the month cannot overflow
  cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);
  const daysInTargetMonth = new Date(
    cutoff.getFullYear(),
    cutoff.getMonth() + 1,
    0,
  ).getDate();
  cutoff.setDate(Math.min(day, daysInTargetMonth));
  return cutoff;
}

/** 
 * Weeks (Monday to Sunday, device-local time)
 * Note: assessment.week_start ISNT used bc its default is the day the row was inserted, not a Monday
*/

const pad = (value: number) => String(value).padStart(2, "0");
const isoDay = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Monday 00:00 (local) of the week containing the date */
export function weekStartOf(date: Date): Date {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (day.getDay() + 6) % DAYS_PER_WEEK; // Sunday (0) counts as day 6
  day.setDate(day.getDate() - daysSinceMonday);
  return day;
}

/** "18-24 May", or "27 Apr-03 May" when the week spans two months */
export function weekLabel(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + DAYS_PER_WEEK - 1);
  const from = pad(start.getDate());
  const to = pad(end.getDate());
  return start.getMonth() === end.getMonth()
    ? `${from}-${to} ${MONTHS[start.getMonth()]}`
    : `${from} ${MONTHS[start.getMonth()]}-${to} ${MONTHS[end.getMonth()]}`;
}