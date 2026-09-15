/** Validates shared form fields and checks route question indexes. */
// This file validates shared form answers and keeps workflow steps in range.
import { isFourDigits as isValidPin } from './input-format';

// Route parameters can be stale or malformed. Fall back to the first step rather
// than indexing outside the current flow’s questions.
/**
 * Converts a route value into a valid question index.
 *
 * @param value - Question index received from a route.
 * @param count - Number of questions in the flow.
 * @returns A valid index, or zero when the value is invalid or outside the flow.
 */
export function workflowStep(value: string, count: number) {
  const step = Number(value);
  return Number.isInteger(step) && step >= 0 && step < count ? step : 0;
}

// Shared by onboarding and prescriptions. Whitespace alone is never an answer;
// fields with numeric meaning also need format and range checks.
/** Checks an entered value using the rules for its field. */
export function validAnswer(label: string, value = '') {
  if (label === 'Create PIN' || label === 'Enter PIN') return isValidPin(value);
  const answer = value.trim();
  if (label === 'Your email address') {
    // Accept ordinary email addresses, including plus aliases, without requiring
    // delivery verification here; sending and verifying codes belongs to the server.
    return answer.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer);
  }
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
