/**
 * Calculates scores for sections that requiring scoring (0 to 5 each)
 * First option = 0, Last option = 5
 * Sections: movement, social health and personal care assessments
 */
export function getSectionScore(selectedValue: any, scaleList: string[]): number {
  if (!selectedValue || !Array.isArray(scaleList) || scaleList.length <= 1) {
    return 0;
  }
  const index = scaleList.indexOf(selectedValue);
  return index === -1 ? 0 : index;
}