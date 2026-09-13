export type AssessmentId = 'pain' | 'movement' | 'personal' | 'social' | 'management';
export type AssessmentAnswers = Record<number, string[]>;
export interface AssessmentQuestion {
  title: string;
  prompt: string;
  kind: 'multi' | 'single' | 'score' | 'number' | 'text';
  options?: string[];
  optional?: boolean;
  helper?: string;
}
export interface AssessmentDefinition {
  title: string;
  questions: AssessmentQuestion[];
  tip: string;
  summary: string;
}
export interface SummarySection {
  title: string;
  text: string;
}
