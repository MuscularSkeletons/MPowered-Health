// Compatibility boundary for previously shared /workflow?flow= links.
import { workflowStep } from '@/shared/forms/validation';
import { Redirect, useLocalSearchParams } from 'expo-router';
export default function WorkflowEntry() {
  const params = useLocalSearchParams<{ flow?: string; step?: string; fresh?: string }>();
  const { flow = 'onboarding', ...rest } = params;
  if (flow === 'onboarding')
    return (
      <Redirect
        href={{
          pathname: '/onboarding/[step]',
          params: { ...rest, step: String(workflowStep(params.step ?? '0', 11)) },
        }}
      />
    );
  if (flow === 'appointment')
    return (
      <Redirect
        href={{
          pathname: Number(params.step) > 0 ? '/appointment/questions' : '/appointment/details',
          params: rest,
        }}
      />
    );
  const routes = {
    login: '/login',
    reflection: '/reflection',
    tips: '/tips',
    profile: '/profile',
    prescriptions: '/prescriptions',
    records: '/health-records',
    settings: '/settings',
  } as const;
  return (
    <Redirect
      href={{ pathname: routes[flow as keyof typeof routes] ?? '/settings', params: rest }}
    />
  );
}
