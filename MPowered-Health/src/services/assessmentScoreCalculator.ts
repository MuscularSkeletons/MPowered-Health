/** Calculates the scores for movement, social health and personal care assessments */

// Definitions related to assessment questions that require a score calculation
interface QuestionItem {
  id: string;
  title: string;
  prompt: string;
  kind: 'single' | 'multi' | 'score' | 'number' | 'text';
  options?: string[];
  helper?: string;
  optional?: boolean;
}

export interface QuestionsConfig {
  title: string;
  tip: string;
  calculateScore: (answers: Record<string, any>) => {
    extraFields: Record<string, any>;
    summaryMessage: string;
  };
  questions: QuestionItem[];
}

/**
 * Calculates scores for sections that requiring scoring (0 to 5 each)
 * First option = 0, Last option = 5
 */
export function getSectionScore(selectedValue: any, scaleList: string[]): number {
  if (!selectedValue || !Array.isArray(scaleList) || scaleList.length <= 1) {
    return 0;
  }
  const index = scaleList.indexOf(selectedValue);
  return index === -1 ? 0 : index;
}