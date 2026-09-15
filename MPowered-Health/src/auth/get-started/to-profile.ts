import type { Profile } from '@/shared/account/profile';

/** Builds an account profile from the registration answers. */
export function profileFromAnswers(
  fields: Record<string, string>,
  choices: Record<number, string[]>,
): Profile {
  // Translate numbered onboarding answers into the named profile stored by the app.
  const name = Object.entries(fields).find(([key]) => key.endsWith('-Type your name'))?.[1] ?? '';
  return {
    email: fields['0-Your email address'] ?? '',
    name,
    sex: choices[4]?.[0] ?? '',
    birthYear: fields['5-Year of birth'] ?? '',
    diagnosis: choices[6]?.[0] ?? '',
    conditions: choices[7] ?? [],
    otherConditions: fields['8-Other conditions'] ?? '',
  };
}
