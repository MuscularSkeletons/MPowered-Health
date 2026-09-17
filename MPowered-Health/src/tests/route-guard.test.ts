import { requiredSessionRoute } from '@/navigation/route-guard';

describe('session routing', () => {
  it('keeps signed-out users in authentication and redirects protected routes', () => {
    expect(requiredSessionRoute({ user: null, rootSegment: '(auth)', nestedSegment: 'login' })).toBeNull();
    expect(requiredSessionRoute({ user: null, rootSegment: '(tabs)' })).toBe('/(auth)/splashscreen');
  });

  it('keeps incomplete profiles in onboarding', () => {
    const user = { onboardingComplete: false };
    expect(requiredSessionRoute({ user, rootSegment: '(auth)', nestedSegment: '(onboarding)' })).toBeNull();
    expect(requiredSessionRoute({ user, rootSegment: '(tabs)' })).toBe('/(auth)/(onboarding)/onboarding');
  });

  it('allows activation after completion before entering tabs', () => {
    const user = { onboardingComplete: true };
    expect(requiredSessionRoute({ user, rootSegment: '(auth)', nestedSegment: 'activation' })).toBeNull();
    expect(requiredSessionRoute({ user, rootSegment: '(tabs)' })).toBeNull();
    expect(requiredSessionRoute({ user, rootSegment: '(auth)', nestedSegment: 'login' })).toBe('/(tabs)');
  });
});
