import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { workflowStep } from '@/shared/forms/validation';

// Preserve old links with one redirect implementation and the original parameters.
function redirectTo(pathname: string) {
  return function LegacyRedirect() {
    const params = useLocalSearchParams();
    return <Redirect href={{ pathname, params }} />;
  };
}
export function LegacyLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
export const Registration = redirectTo('/get-started/[step]');
export const Activation = redirectTo('/get-started-loading');
export const AppointmentDetails = redirectTo('/appointment/details');
export const AppointmentQuestions = redirectTo('/appointment/questions');
export const AppointmentReview = redirectTo('/appointment/review');
export const PrescriptionEditor = redirectTo('/prescriptions/edit');
export const Prescriptions = redirectTo('/prescriptions');
export const Profile = redirectTo('/profile');
export const Reflection = redirectTo('/reflection');
export const PainGuide = redirectTo('/tips');
export function registrationSteps() {
  return Array.from({ length: 11 }, (_, step) => ({ step: String(step) }));
}

export function WorkflowEntry() {
  const params = useLocalSearchParams<{ flow?: string; step?: string; fresh?: string }>();
  const { flow = 'onboarding', ...rest } = params;
  if (flow === 'onboarding')
    return (
      <Redirect
        href={{
          pathname: '/get-started/[step]',
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
