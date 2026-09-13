import { registerProfile } from '@/features/account/services/account';
import { QuestionFields } from '@/features/auth/components/RegistrationFields';
import { onboarding } from '@/features/auth/models/onboarding';
import { isStepReady } from '@/features/auth/services/registration-validation';
import { useRegistration } from '@/features/auth/state/RegistrationProvider';
import { Shell } from '@/shared/forms/FormScreen';
import { s } from '@/shared/forms/styles';
import { workflowStep } from '@/shared/forms/validation';
import { ActionButton } from '@/shared/ui/mha-ui';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { profileFromAnswers } from '../services/registration-profile';
export default function OnboardingStepScreen() {
  const params = useLocalSearchParams<{ step: string; name?: string; fresh?: string }>();
  const step = workflowStep(params.step, onboarding.steps.length);
  const question = onboarding.steps[step];
  const { draft, dispatch } = useRegistration();
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState('');
  const name = draft.fields['3-Type your name']?.trim() || params.name || 'there';
  const complete = step === 10;
  const ready = isStepReady(question, step, draft);
  const navigate = (next: number) =>
    router.push({
      pathname: '/onboarding/[step]',
      params: { ...params, step: String(next) },
    });
  const next = async (skip = false) => {
    if (busy.current || (!skip && !ready)) return;
    if (skip) dispatch({ type: 'skip', step, fields: question.fields });
    if (step === 9) {
      busy.current = true;
      setSaving(true);
      setError('');
      try {
        await registerProfile(
          profileFromAnswers({ ...draft.fields, '3-Type your name': name }, draft.values),
          draft.fields['9-Create PIN'],
        );
        dispatch({ type: 'field', key: '9-Create PIN', value: '' });
        navigate(10);
      } catch {
        setError('Your account could not be saved. Check your answers and try again.');
      } finally {
        busy.current = false;
        setSaving(false);
      }
    } else if (complete) router.replace({ pathname: '/dashboard', params: { name } });
    else navigate(step + 1);
  };
  return (
    <>
      <StatusBar hidden />
      <Shell
        title={complete ? `Thank you, ${name} 😃` : question.title}
        onBack={() =>
          step
            ? router.canGoBack()
              ? router.back()
              : navigate(step - 1)
            : router.replace('/splash')
        }
      >
        <Text style={s.flowEyebrow}>
          {step + 1}/{onboarding.steps.length}
        </Text>
        <Text style={s.copy}>{question.copy}</Text>
        {error ? (
          <Text accessibilityRole="alert" style={s.fieldError}>
            {error}
          </Text>
        ) : null}
        <QuestionFields question={question} step={step} disabled={saving} />
        <View style={s.footer}>
          <ActionButton
            label={saving ? 'Saving…' : (question.action ?? 'Continue')}
            disabled={!ready || saving}
            onPress={() => next()}
          />
          {question.optional ? (
            <Pressable disabled={saving} onPress={() => next(true)}>
              <Text style={s.skip}>Skip</Text>
            </Pressable>
          ) : !ready ? (
            <Text style={s.required}>Complete the required information to continue.</Text>
          ) : null}
        </View>
      </Shell>
    </>
  );
}
