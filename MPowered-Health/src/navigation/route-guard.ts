export type SessionUser = { onboardingComplete?: boolean } | null;

const assessmentRoutes = new Set([
  'assessment',
  'my-pain',
  'my-movement',
  'my-personal-care',
  'my-social-health',
  'my-management',
]);

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
  const inAssessment = rootSegment ? assessmentRoutes.has(rootSegment) : false;

  if (!user) return inAuthSection ? null : '/(auth)/login';
  if (!user.onboardingComplete) {
    return inOnboardingSection ? null : '/(auth)/(onboarding)/onboarding';
  }
  // Saving the profile changes the session before the onboarding screen unmounts.
  // Send that transition to activation instead of skipping straight to the tabs.
  if (inOnboardingSection) return '/(auth)/activation';
  return inTabsSection || inActivationScreen || inAssessment ? null : '/(tabs)';
}
