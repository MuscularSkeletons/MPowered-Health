/** Defines the data shapes used by health records; this file does not run a screen. */
export type AssessmentId = 'pain' | 'movement' | 'personal' | 'social' | 'management';
// Keys are zero-based question indexes. Each value is a list, including single-choice and score answers.
export type AssessmentAnswers = Record<number, string[]>;
export interface AssessmentQuestion {
  title: string;
  prompt: string;
  // Selects the input control and its validation rule in the shared assessment flow.
  kind: 'multi' | 'single' | 'score' | 'number' | 'text';
  options?: string[];
  optional?: boolean;
  helper?: string;
}
export interface AssessmentDefinition {
  title: string;
  // Order matters: saved answers and summary builders refer to these positions.
  questions: AssessmentQuestion[];
  tip: string;
  summary: string;
}
export interface SummarySection {
  title: string;
  text: string;
}
