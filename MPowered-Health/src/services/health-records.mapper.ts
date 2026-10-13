/**
 * Helpers that turn Supabase rows into the shapes the My Health screens read.
 * No network or React imports here, so every function can be unit tested!
 */
import type { AssessmentAnswers, AssessmentId } from '@/shared/health-records/assessment-types';
import type { PainAssessmentRecord } from '@/shared/health-records/pain-history';

/** Assessments older than this are removed by the cleanup job and must never be shown. */
export const RETENTION_MONTHS = 18;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;
/** The overview insight needs at least a month of use (form acceptance criteria). */
const MIN_INSIGHT_SPAN_DAYS = 28;
/** The overview design plots three weekly points. */
const INSIGHT_POINTS = 3;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


// Row shapes

export interface PainRow {
  current_pain: number;
  mildest_pain: number;
  worst_pain: number;
  average_pain: number;
  pain_location: string[];
  pain_characteristics: string[];
}
export interface MovementRow {
  active_hour: string;
  general_impacts: string[] | null;
  walking_impact: string;
  lifting_impact: string;
  sitting_impact: string;
  standing_impact: string;
  movement_reflection: string | null;
}
export interface PersonalCareRow {
  activities_impact: string[] | null;
  personal_care_impact: string;
  sleeping_impact: string;
  care_reflection: string | null;
}
export interface SocialRow {
  social_life: string;
  travelling: string;
  mood_impact: number;
  relation_impact: number;
  enjoyment_impact: number;
  general_mood: string;
  mood_trigger: string | null;
}
export interface ManagementRow {
  medication: string[] | null;
  otc_medication: string | null;
  exercise_frequency: string;
  emotion_strategies: string | null;
}

/** PostgREST returns a child as an array, or as one object when foreign key is unique. */
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

export type LatestAssessment = { answers: AssessmentAnswers; completedAt: string };
export interface HealthSnapshot {
  /** Oldest first, matching what groupPainHistory expects. */
  painRecords: PainAssessmentRecord[];
  /** The newest answers for each assessment type that has any data. */
  latest: Partial<Record<AssessmentId, LatestAssessment>>;
}

function first<T>(value: OneOrMany<T> | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
const one = (value: string | null | undefined): string[] => (value ? [value] : []);
const score = (value: number): string[] => [String(value)];

