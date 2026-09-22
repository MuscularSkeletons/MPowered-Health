import { requiredSessionRoute } from '@/navigation/route-guard';

describe('session routing', () => {
  it('keeps signed-out users in authentication and redirects protected routes', () => {
    expect(requiredSessionRoute({ user: null, rootSegment: '(auth)', nestedSegment: 'login' })).toBeNull();
    expect(requiredSessionRoute({ user: null, rootSegment: '(tabs)' })).toBe('/(auth)/login');
  });

  it('opens Login for a fresh launch or a direct assessment link without a current login', () => {
    for (const rootSegment of [undefined, '(tabs)', 'assessment', 'my-pain']) {
      expect(requiredSessionRoute({ user: null, rootSegment })).toBe('/(auth)/login');
    }
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

  it('allows completed users to open assessment routes', () => {
    const user = { onboardingComplete: true };
    expect(requiredSessionRoute({ user, rootSegment: 'my-pain' })).toBeNull();
    expect(requiredSessionRoute({ user, rootSegment: 'my-management' })).toBeNull();
  });

  it('opens activation when the saved profile becomes complete while still in onboarding', () => {
    const route = { rootSegment: '(auth)', nestedSegment: '(onboarding)' };
    expect(requiredSessionRoute({ ...route, user: { onboardingComplete: false } })).toBeNull();
    expect(requiredSessionRoute({ ...route, user: { onboardingComplete: true } })).toBe('/(auth)/activation');
  });
});
