/** Defines interfaces and types related to the assessments data */

/** Used by health profile feature to define the assessment types */
export type AssessmentId = 'pain' | 'movement' | 'personal' | 'social' | 'management';

/** 
 * Used by health profile to define answers to assessments
 * Keys are zero-based question indexes
 * Each value is a list, including single-choice and score answers
*/
export type AssessmentAnswers = Record<number, string[]>;

/** Used to retrieved completed assessment data for the week by the useAssessments hook */
export interface CurrentWeeklyAssessmentState {
  completedCategories: string[];
  answersByCategory: Record<string, Record<string, any>>;
}

/** Extract the relevant pain assessment data to pass to question mapper */
export interface PainAssessment {
    pain_location: string[];
    worst_pain: number;
    mildest_pain: number;
    average_pain: number;
    current_pain: number;
}