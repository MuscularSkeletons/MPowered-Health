const completedAssessments = new Set<string>();
export type AssessmentAnswers = Record<number, string[]>;
const assessmentAnswers = new Map<string, AssessmentAnswers>();
export type PainRecord = { date: string; score: number };
const painRecords: PainRecord[] = [
  { date: '25/05', score: 5 },
  { date: '01/06', score: 5 },
  { date: '08/06', score: 7 },
];
const weeklyStreak = 3;

function cloneAnswers(answers: AssessmentAnswers): AssessmentAnswers {
  return Object.fromEntries(Object.entries(answers).map(([step, values]) => [step, [...values]]));
}

export function markAssessmentCompleted(type: string, answers?: AssessmentAnswers) {
  completedAssessments.add(type);
  if (answers) assessmentAnswers.set(type, cloneAnswers(answers));
}

export function getCompletedAssessments() {
  return [...completedAssessments];
}

export function getAssessmentAnswers(type: string) {
  const answers = assessmentAnswers.get(type);
  return answers ? cloneAnswers(answers) : undefined;
}

export function addPainRecord(score: number) {
  const now = new Date();
  const date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  painRecords.push({ date, score: Math.max(0, Math.min(10, score)) });
}

export function getPainRecords() {
  return [...painRecords];
}

export function getWeeklyStreak() {
  return weeklyStreak;
}
