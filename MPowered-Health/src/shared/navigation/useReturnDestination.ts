import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

/** Returns a leave action for an allowed return route and handles Android Back while focused. */
export function useReturnDestination(fallback: '/(tabs)' | '/(tabs)/careplanner' | '/(tabs)/myhealth') {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  // Accept only known in-app destinations; arbitrary route parameters cannot choose the Back target.
  const destination =
    returnTo === '/(tabs)/myhealth' || returnTo === '/(tabs)/careplanner' || returnTo === '/(tabs)'
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
