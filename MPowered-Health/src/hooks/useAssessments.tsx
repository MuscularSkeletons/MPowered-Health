import { supabase } from '@/lib/supabase/client';
import { type CurrentWeeklyAssessmentState } from '@/types/assessment';
import { buildSnapshot, retentionCutoff, type AssessmentRow, type HealthSnapshot } from '@/services/assessmentDataMapper';
import { MAX_ASSESSMENTS } from '@/constants/myhealth/assessments';

/**
 * Assessment CRUD (create, read, update, delete) with Supabase
 * RLS ensure every call is by the user
*/

/** Map database assessment name to UI displayable name */
const TABLE_MAP: Record<string, string> = {
  'My Pain': 'pain_assessment',
  'My Movement': 'movement_assessment',
  'My Personal Care': 'personal_care_assessment',
  'My Social Health': 'social_health_assessment',
  'My Management': 'management_assessment',
};

/** Helper to get Monday of the current week (YYYY-MM-DD) */
export function getCurrentWeekStartDate(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // monday
  d.setDate(diff);

  // Get the local date
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // two digits format for months
  const date = String(d.getDate()).padStart(2, '0'); // two digits format for date
  
  return year + '-' + month + '-' + date; 
}

function localDateFromIso(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function localIsoDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Unable to verify your account: ${error.message}`);
  }

  if (!user) {
    throw new Error('Please sign in again before saving your assessment.');
  }

  return user.id;
}

/** Returns the number of consecutive weeks (streak) in which the signed-in user checked in */
export async function getWeeklyAssessmentStreak(): Promise<number> {
  const activeUserId = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from('assessment')
    .select('week_start')
    .eq('user_id', activeUserId)
    .order('week_start', { ascending: false });

  if (error) {
    throw new Error(`Unable to load your weekly streak: ${error.message}`);
  }

  const completedWeeks = new Set(
    (data || [])
      .map((row) => row.week_start)
      .filter((weekStart): weekStart is string => typeof weekStart === 'string'),
  );

  if (!completedWeeks.size) return 0;

  const currentWeek = getCurrentWeekStartDate();
  const cursor = localDateFromIso(currentWeek);

  // Begin counting streak from previous week if the current week hasn't been completed yet
  if (!completedWeeks.has(currentWeek)) cursor.setDate(cursor.getDate() - 7);

  let streak = 0;
  while (completedWeeks.has(localIsoDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }

  return streak;
}

/**
 * Loads this week's saved answers without creating an empty assessment
 * This keeps the home-screen progress accurate after the app is reopened
 */
export async function getCurrentWeeklyAssessmentState(): Promise<CurrentWeeklyAssessmentState> {
  const activeUserId = await getAuthenticatedUserId();
  const weekStart = getCurrentWeekStartDate();
  const { data: assessment, error: assessmentError } = await supabase
    .from('assessment')
    .select('assessment_id')
    .eq('week_start', weekStart)
    .eq('user_id', activeUserId)
    .maybeSingle();

  if (assessmentError) {
    throw new Error(`Unable to load this week's progress: ${assessmentError.message}`);
  }

  if (!assessment) {
    return { completedCategories: [], answersByCategory: {} };
  }

  const categoryRecords = await Promise.all(
    Object.entries(TABLE_MAP).map(async ([categoryTitle, tableName]) => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('assessment_id', assessment.assessment_id)
        .maybeSingle();

      if (error) {
        throw new Error(`Unable to load ${categoryTitle}: ${error.message}`);
      }

      return [categoryTitle, data] as const;
    }),
  );

  const completedCategories: string[] = [];
  const answersByCategory: Record<string, Record<string, any>> = {};

  categoryRecords.forEach(([categoryTitle, record]) => {
    if (!record) return;
    completedCategories.push(categoryTitle);
    answersByCategory[categoryTitle] = record;
  });

  return { completedCategories, answersByCategory };
}

/**
 * Gets the active assessment_id for the current week or creates one if it doesn't exist yet
*/
export async function getOrCreateCurrentWeeklyAssessment(
  userId: string | null = null
): Promise<string | number> {
  const weekStart = getCurrentWeekStartDate();
  const activeUserId = userId || (await getAuthenticatedUserId());

  /** 
   * A weekly assessment belongs to one user
   * Filtering only by week can select another person's record or make maybeSingle 
   * fail when several people have completed an assessment in the same week 
  */
  const query = supabase
    .from('assessment')
    .select('assessment_id')
    .eq('week_start', weekStart)
    .eq('user_id', activeUserId);

  const { data: existing, error: fetchError } = await query.maybeSingle();

  if (fetchError) {
    console.error('Error fetching weekly assessment:', fetchError);
    throw fetchError;
  }

  if (existing) {
    return existing.assessment_id;
  }

  // If assessment for that week doesn't exist, create it
  const newRecord = {
    week_start: weekStart,
    user_id: activeUserId,
  };

  const { data: created, error: insertError } = await supabase
    .from('assessment')
    .insert([newRecord])
    .select('assessment_id')
    .single();

  if (insertError) {
    console.error('Error creating weekly assessment:', insertError);
    throw insertError;
  }

  return created.assessment_id;
}

/**
 * Submits assessment answers to Supabase
 */
export async function submitAssessmentAnswers(
  categoryTitle: string,
  answers: Record<string, any>,
  extraFields: Record<string, any> = {},
  explicitAssessmentId: string | number | null = null
) {
  const tableName = TABLE_MAP[categoryTitle];

  if (!tableName) {
    throw new Error(`No Supabase table configured for category: "${categoryTitle}"`);
  }

  const assessmentId =
    explicitAssessmentId || (await getOrCreateCurrentWeeklyAssessment());

  const payload = {
    ...answers,
    ...extraFields,
    assessment_id: assessmentId,
  };

  const { data, error } = await supabase
    .from(tableName)

    // Updating the same assessment in the same week replaces its previous answers
    .upsert(payload, { onConflict: 'assessment_id' })
    .select();

  if (error) {
    console.error('Supabase Insert Error:', error);
    throw error;
  }

  return data;
}

/**
 * Saves the weekly reflection text directly to the parent 'assessment' table
 */
export async function saveWeeklyReflection(
  reflectionText: string,
  explicitAssessmentId: string | number | null = null
) {
  const assessmentId =
    explicitAssessmentId || (await getOrCreateCurrentWeeklyAssessment());

  const { data, error } = await supabase
    .from('assessment')
    .update({ weekly_reflection: reflectionText })
    .eq('assessment_id', assessmentId)
    .select();

  if (error) {
    console.error('Error saving weekly reflection:', error);
    throw error;
  }

  return data;
}

/**
 * Retrieves the current week's reflection text
 */
export async function getWeeklyReflection(): Promise<string> {
  const activeUserId = await getAuthenticatedUserId();
  const weekStart = getCurrentWeekStartDate();

  const { data, error } = await supabase
    .from('assessment')
    .select('weekly_reflection')
    .eq('week_start', weekStart)
    .eq('user_id', activeUserId)
    .maybeSingle();

  if (error) {
    console.error('Error loading reflection:', error);
    return '';
  }

  return data?.weekly_reflection || '';
}

/**
 * Reads all user's assessments from Supabase in one go from within the data retention period
 * Used by my health feature
 */
export async function fetchHealthSnapshot(userId: string): Promise<HealthSnapshot> {
  const { data, error } = await supabase
    .from('assessment')
    .select(`
      assessment_id,
      date,
      pain_assessment(*),
      movement_assessment(*),
      personal_care_assessment(*),
      social_health_assessment(*),
      management_assessment(*)
    `)
    .eq('user_id', userId)
    .gte('date', retentionCutoff().toISOString())
    .order('date', { ascending: false })
    .limit(MAX_ASSESSMENTS);

  // PGRST200 means a foreign key from a child table to assessment is missing
  if (error) throw new Error(`Could not load health records (${error.code ?? 'unknown'}).`);

  return buildSnapshot((data ?? []) as unknown as AssessmentRow[]);
}