/** Defines the registration draft and the rules for changing its answers. */
// defines how answers change
// for example, entering a name, selecting conditions or skipping a question.

export interface RegistrationDraft {
  fields: Record<string, string>;
  values: Record<number, string[]>;
}
export type RegistrationAction =
  | { type: 'field'; key: string; value: string }
  | { type: 'choice'; step: number; value: string; multi?: boolean }
  | { type: 'skip'; step: number; fields?: string[] };

/** Returns updated registration answers after a field change, selection, or skip. */
export function registrationReducer(
  state: RegistrationDraft,
  action: RegistrationAction,
): RegistrationDraft {
  if (action.type === 'field')
    return { ...state, fields: { ...state.fields, [action.key]: action.value } };
  if (action.type === 'choice') {
    const selected = state.values[action.step] ?? [];
    const value = action.multi
      ? selected.includes(action.value)
        ? selected.filter((v) => v !== action.value)
        : [...selected, action.value]
      : [action.value];
    return { ...state, values: { ...state.values, [action.step]: value } };
  }
  const fields = { ...state.fields };
  action.fields?.forEach((field) => delete fields[`${action.step}-${field}`]);
  return { fields, values: { ...state.values, [action.step]: [] } };
}
