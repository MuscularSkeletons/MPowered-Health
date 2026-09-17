export type SessionUser = { onboardingComplete?: boolean } | null;

/** Returns the required route for the current backend session, or null when the route is allowed. */
export function requiredSessionRoute({
  user,
  rootSegment,
  nestedSegment,
}: {
  user: SessionUser;
  rootSegment?: string;
  nestedSegment?: string;
}) {
  const inAuthSection = rootSegment === '(auth)';
  const inTabsSection = rootSegment === '(tabs)';
  const inOnboardingSection = inAuthSection && nestedSegment === '(onboarding)';
  const inActivationScreen = inAuthSection && nestedSegment === 'activation';

  if (!user) return inAuthSection ? null : '/(auth)/splashscreen';
  if (!user.onboardingComplete) {
    return inOnboardingSection ? null : '/(auth)/(onboarding)/onboarding';
  }
  return inTabsSection || inActivationScreen ? null : '/(tabs)';
}
