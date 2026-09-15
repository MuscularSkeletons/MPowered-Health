/** Defines profile fields, initial values, and required-field validation. */
import { diagnosisOptions, painConditions, sexOptions } from '@/shared/account/profile-options';
import { validAnswer } from '@/shared/forms/validation';
export type Profile = {
  // This is the complete local profile shape shared by registration and settings.
  email: string;
  name: string;
  sex: string;
  birthYear: string;
  diagnosis: string;
  conditions: string[];
  otherConditions: string;
};
export const emptyProfile: Profile = {
  // Forms start with controlled empty values instead of undefined fields.
  email: '',
  name: '',
  sex: '',
  birthYear: '',
  diagnosis: '',
  conditions: [],
  otherConditions: '',
};

// The editor and onboarding use the same validation and option lists.
/** Returns a field-by-field list of problems in a profile. */
export function profileErrors(profile: Profile) {
  // Collect every problem at once so the editor can mark all affected fields.
  const errors: Partial<Record<keyof Profile, string>> = {};
  if (!validAnswer('Your email address', profile.email))
    errors.email = 'Enter a valid email address.';
  if (!profile.name.trim()) errors.name = 'Your name is required.';
  if (!sexOptions.includes(profile.sex)) errors.sex = 'Select an answer.';
  if (profile.birthYear.trim() && !validAnswer('Year of birth', profile.birthYear))
    errors.birthYear = 'Enter a valid four-digit birth year, or leave blank.';
  if (!diagnosisOptions.includes(profile.diagnosis)) errors.diagnosis = 'Select an answer.';
  if (profile.conditions.some((condition) => !painConditions.includes(condition)))
    errors.conditions = 'Select conditions from the list.';
  return errors;
}
