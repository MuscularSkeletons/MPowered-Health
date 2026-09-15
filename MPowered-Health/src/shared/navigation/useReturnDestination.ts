/** Returns a leave action for an allowed return route and handles Android Back while focused. */
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

/** Returns a leave action for an allowed return route and handles Android Back while focused. */
export function useReturnDestination(fallback: '/dashboard' | '/care') {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const destination =
    returnTo === '/explore' || returnTo === '/care' || returnTo === '/dashboard'
      ? returnTo
      : fallback;
  const leave = useCallback(() => router.replace(destination), [destination]);
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        leave();
        return true;
      });
      return () => subscription.remove();
    }, [leave]),
  );
  return leave;
}
