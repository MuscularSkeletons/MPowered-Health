export type SessionUser = { onboardingComplete?: boolean } | null;

/** Returns the required route for the current backend session, or null when the route is allowed */
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

  /**  
   * no user -> splashscreen
   * unless currently in auth section, in which case stay there
  */
  if (!user) {
    return inAuthSection ? null : '/(auth)/splashscreen';
  } 

  /** 
   * user created but onboarding incomplete -> first onboarding screen
   * unless user currently completing onboarding, in which case stay there
  */
  if (!user.onboardingComplete) {
    return inOnboardingSection ? null : '/(auth)/(onboarding)/onboarding';
  }

  /** 
   * user created, onboarding completed but still in the onboarding section 
   * -> transition to activation screen first instead of skipping straight to the homepage
  */
  if (inOnboardingSection) {
    return '/(auth)/activation';
  } 

  /** 
   * user created, onboarding completed, and no longer in onboarding section 
   * -> stay where you are, or go to the homepage if reopening the app but session is still persisting
  */
  return inTabsSection || inActivationScreen ? null : '/(tabs)/(assessment)';
}
