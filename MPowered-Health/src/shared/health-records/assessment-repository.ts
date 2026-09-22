/** Saves My Pain to Supabase and keeps the other questionnaires ready for future backend work. */
import { supabase } from '@/lib/supabase/client';
import type { AssessmentAnswers, AssessmentId } from './assessment-types';

type AssessmentInsert = { table: string; values: Record<string, unknown> };

/** Formats the completion date shown on an assessment summary. */
export const currentAssessmentPeriod = (date = new Date()) =>
  `Recorded ${date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;

/** Reads the first answer for a question, using null for an unanswered optional question. */
const first = (answers: AssessmentAnswers, index: number) => answers[index]?.[0] ?? null;

/** Reads a required 0–10 score as a number. */
const score = (answers: AssessmentAnswers, index: number) => {
  const value = Number(first(answers, index));
  if (!Number.isInteger(value) || value < 0 || value > 10) {
    throw new Error('Assessment score must be a whole number from 0 to 10.');
  }
  return value;
};

/** Maps My Pain to its live table. Other questionnaires have no backend mapping yet. */
export function buildAssessmentInsert(
  assessmentId: AssessmentId,
  answers: AssessmentAnswers,
  completedAt = new Date().toISOString(),
): AssessmentInsert | null {
  if (assessmentId === 'pain') {
    return {
      table: 'pain_assessment',
      values: {
        pain_location: answers[0] ?? [],
        pain_characteristics: answers[1] ?? [],
        current_pain: score(answers, 2),
        mildest_pain: score(answers, 3),
        worst_pain: score(answers, 4),
        average_pain: score(answers, 5),
        created_at: completedAt,
      },
    };
  }

  // TODO (backend teammate): map Movement, Personal Care, Social Health, and Management here.
  // Return a table and values when each endpoint is ready; the shared save flow will handle it.
  return null;
}

/** Creates a UUID for the parent assessment record. */
const createUuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

/** Returns the authenticated account that owns the assessment. */
async function assessmentUserId() {
  const current = await supabase.auth.getSession();
  if (current.error) throw new Error(`Unable to open your assessment session: ${current.error.message}`);
  if (!current.data.session) throw new Error('Please sign in again before saving your assessment.');
  return current.data.session.user.id;
}

/** Saves one completed questionnaire and surfaces any backend error to the form. */
export async function saveAssessmentRecord(
  assessmentId: AssessmentId,
  answers: AssessmentAnswers,
  completedAt = new Date().toISOString(),
) {
  const insert = buildAssessmentInsert(assessmentId, answers, completedAt);
  // Without a backend mapping, answers and completion stay in the current app session.
  // The screen still supports answering, summaries, and Edit through useAssessmentFlow.
  if (!insert) return;
  const userId = await assessmentUserId();

  const assessmentRecordId = createUuid();
  // Keep the complete answer set in the parent so wording that has no dedicated column is not lost.
  const parent = await supabase
    .from('Assessment')
    .insert([
      {
        assessment_id: assessmentRecordId,
        date: completedAt,
        user_id: userId,
        reflection: JSON.stringify({ assessment: assessmentId, answers }),
      },
    ]);
  if (parent.error) throw new Error(`Unable to create the assessment record: ${parent.error.message}`);

  const { error } = await supabase
    .from(insert.table)
    .insert([{ ...insert.values, assessment_id: assessmentRecordId }]);
  if (error) {
    // Remove an empty parent record when its questionnaire row fails.
    await supabase.from('Assessment').delete().eq('assessment_id', assessmentRecordId);
    throw new Error(`Unable to save ${assessmentId} assessment: ${error.message}`);
  }
}
