/** Controls account startup, retry feedback, and access to private screens after deletion. */
import { router, useGlobalSearchParams, usePathname } from 'expo-router';
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  getAccountSnapshot,
  initializeAccount,
  subscribeAccount,
} from '@/shared/account/repository';

/** Waits for account startup and prevents deleted accounts from reopening private screens. */
export function AccountBoundary({ children }: { children: ReactNode }) {
  const account = useSyncExternalStore(subscribeAccount, getAccountSnapshot, getAccountSnapshot);
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ flow?: string }>();
  const [startupError, setStartupError] = useState(false);

  /**
   * Retries account initialization after a startup error.
   *
   * Existing screens stay blocked until startup succeeds.
   */
  const start = () => {
    setStartupError(false);
    initializeAccount().catch(() => setStartupError(true));
  };

  useEffect(() => {
    initializeAccount().catch(() => setStartupError(true));
  }, []);
  useEffect(() => {
    // Deleted accounts cannot reopen old patient screens through tab/browser history.
    const publicScreen =
      ['/', '/splash', '/get-started-loading', '/onboarding-loading'].includes(pathname) ||
      (pathname === '/workflow' && (params.flow ?? 'onboarding') === 'onboarding') ||
      pathname.startsWith('/get-started/') ||
      pathname.startsWith('/onboarding/');
    if (account.ready && account.deleted && !publicScreen) router.replace('/splash');
  }, [account.ready, account.deleted, pathname, params.flow]);
  if (!account.ready)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>{startupError ? 'Unable to load account data.' : 'Loading…'}</Text>
        {startupError ? (
          <Pressable accessibilityRole="button" onPress={start}>
            <Text>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    );
  return (
    // A changed revision remounts child screens and discards their unsaved local state.
    <View key={account.revision} style={{ flex: 1 }}>
      {children}
    </View>
  );
}
