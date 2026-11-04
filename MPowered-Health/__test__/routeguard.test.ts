import { requiredSessionRoute } from '@/navigation/routeGuard';

describe('session routing', () => {
  it('keeps signed-out users in authentication and redirects protected routes', () => {
    expect(requiredSessionRoute({ user: null, rootSegment: '(auth)', nestedSegment: 'login', showActivation: false })).toBeNull();
    expect(requiredSessionRoute({ user: null, rootSegment: '(tabs)', showActivation: false })).toBe('/(auth)/splashscreen');
  });

  it('keeps incomplete profiles in onboarding', () => {
    const user = { onboardingComplete: false };
    expect(requiredSessionRoute({ user, rootSegment: '(auth)', nestedSegment: '(onboarding)', showActivation: false })).toBeNull();
    expect(requiredSessionRoute({ user, rootSegment: '(tabs)', showActivation: false })).toBe('/(auth)/(onboarding)/onboarding');
  });

  it('allows activation after completion before entering tabs', () => {
    const user = { onboardingComplete: true };
    expect(requiredSessionRoute({ user, rootSegment: '(auth)', nestedSegment: 'activation', showActivation: false })).toBeNull();
    expect(requiredSessionRoute({ user, rootSegment: '(tabs)', showActivation: false })).toBeNull();
    expect(requiredSessionRoute({ user, rootSegment: '(auth)', nestedSegment: 'login', showActivation: false })).toBe('/(tabs)/(assessment)');
  });

  it('opens activation when the saved profile becomes complete while still in onboarding', () => {
    const route = { rootSegment: '(auth)', nestedSegment: '(onboarding)' };
    expect(requiredSessionRoute({ ...route, user: { onboardingComplete: false }, showActivation: true })).toBeNull();
    expect(requiredSessionRoute({ ...route, user: { onboardingComplete: true }, showActivation: true })).toBe('/(auth)/activation');
  });
});
