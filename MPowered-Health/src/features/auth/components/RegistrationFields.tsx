import { Choice } from '@/shared/forms/Choice';
import { Field } from '@/shared/forms/Field';
import { validAnswer } from '@/shared/forms/validation';
import { Step } from '../models/registration-step';
import { useRegistration } from '../state/RegistrationProvider';
export function QuestionFields({
  question,
  step,
  disabled = false,
  choices = true,
}: {
  question: Step;
  step: number;
  disabled?: boolean;
  choices?: boolean;
}) {
  const { draft, dispatch } = useRegistration();
  const options =
    choices && question.options ? (
      <Choice
        options={question.options}
        value={draft.values[step] ?? []}
        multi={question.multi}
        pick={(value) => dispatch({ type: 'choice', step, value, multi: question.multi })}
      />
    ) : null;
  return (
    <>
      {question.optionsBeforeFields ? options : null}
      {question.fields?.map((label) => {
        const value = draft.fields[`${step}-${label}`] ?? '';
        const error =
          value && !validAnswer(label, value)
            ? label === 'Create PIN'
              ? 'Enter exactly four digits to continue.'
              : label === 'Your email address'
                ? 'Enter a valid email address.'
                : undefined
            : undefined;
        return (
          <Field
            key={label}
            label={label}
            input={
              label === 'Your email address'
                ? 'email'
                : label === 'Create PIN' || label === 'Enter PIN'
                  ? 'pin'
                  : label === 'Year of birth'
                    ? 'year'
                    : 'text'
            }
            value={value}
            error={error}
            editable={!disabled}
            set={(value) => dispatch({ type: 'field', key: `${step}-${label}`, value })}
          />
        );
      })}
      {!question.optionsBeforeFields ? options : null}
    </>
  );
}
