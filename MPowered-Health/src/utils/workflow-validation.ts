// Route parameters can be stale or malformed. Fall back to the first step rather
// than indexing outside the current flow’s questions.
export function workflowStep(value: string, count: number) {
  const step = Number(value);
  return Number.isInteger(step) && step >= 0 && step < count ? step : 0;
}

// Shared by onboarding and prescriptions. Whitespace alone is never an answer;
// fields with numeric meaning also need format and range checks.
export function validAnswer(label: string, value = '') {
  const answer = value.trim();
  if (label === 'Year of birth') {
    return (
      /^\d{4}$/.test(answer) && Number(answer) >= 1900 && Number(answer) <= new Date().getFullYear()
    );
  }
  if (label === 'Strength') {
    return /^\d+(\.\d+)?$/.test(answer) && Number(answer) > 0 && Number.isFinite(Number(answer));
  }
  return answer.length > 0;
}
