import { supabase } from '../../../lib/supabase/client';

const TABLE_MAP: Record<string, string> = {
  'My Pain': 'pain_assessment',
  'My Movement': 'movement_assessment',
  'My Personal Care': 'personal_care_assessment',
  'My Social Health': 'social_health_assessment',
  'My Management': 'management_assessment',
};

// Helper to get Monday of the current week (YYYY-MM-DD)
function getCurrentWeekStartDate(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // monday
  d.setDate(diff);

  // Get the local date
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); //two digits format for months
  const date = String(d.getDate()).padStart(2, '0'); ////two digits format for date
  
  return year + '-' + month + '-' + date; 
}

/**
 * Gets the active assessment_id for the current week,
 * or creates one if it doesn't exist yet.
 */
export async function getOrCreateCurrentWeeklyAssessment(
  userId: string | null = null
): Promise<string | number> {
  const weekStart = getCurrentWeekStartDate();

  // Look for an existing record for this week
  const query = supabase
    .from('assessment')
    .select('assessment_id')
    .eq('week_start', weekStart);

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

  console.log('Submitting to:', tableName, 'with assessment_id:', assessmentId);

  const { data, error } = await supabase
    .from(tableName)
    .insert([payload])
    .select();

  if (error) {
    console.error('Supabase Insert Error:', error);
    throw error;
  }

  return data;
}