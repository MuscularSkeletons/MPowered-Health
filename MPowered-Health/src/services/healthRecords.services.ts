/**
 * Reads user's assessments from Supabase in one trip.
 *
 * Row Level Security decides which rows come back - the user_id filter only helps the query
 * planner. If every list is empty, check RLS policies!
 */
import { supabase } from '@/lib/supabase/client'; // adjust if the client lives elsewhere
import { buildSnapshot, retentionCutoff, type AssessmentRow, type HealthSnapshot } from '@/services/healthRecords.mapper';

// Each assessment has its child rows (pain, movement, personal care, social health, management).
const ASSESSMENTS_WITH_CHILDREN = `
  assessment_id,
  date,
  pain_assessment(*),
  movement_assessment(*),
  personal_care_assessment(*),
  social_health_assessment(*),
  management_assessment(*)
`;

/** 18 months of weekly check-ins is about 80 rows - this cap only guards. */
const MAX_ASSESSMENTS = 500;

/**
 * Loads the pain history and the latest answers for every assessment type.
 *
 * @throws If the request fails, so the session boundary can show its retry screen. The message
 *         carries only the error code and never any health data!
 */
export async function fetchHealthSnapshot(userId: string): Promise<HealthSnapshot> {
  const { data, error } = await supabase
    .from('assessment')
    .select(ASSESSMENTS_WITH_CHILDREN)
    .eq('user_id', userId)
    .gte('date', retentionCutoff().toISOString())
    .order('date', { ascending: false })
    .limit(MAX_ASSESSMENTS);

  // PGRST200 means a foreign key from a child table to assessment is missing.
  if (error) throw new Error(`Could not load health records (${error.code ?? 'unknown'}).`);
  return buildSnapshot((data ?? []) as unknown as AssessmentRow[]);
}