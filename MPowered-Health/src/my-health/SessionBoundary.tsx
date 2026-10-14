import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadPainHistory, setPainHistoryAccount } from '@/shared/health-records/pain-history';
import { restoreAssessmentSession } from '@/shared/health-records/refresh';
import { resetAssessmentSession } from '@/shared/health-records/session';
import { clearPrescriptions, loadPrescriptions } from '@/my-health/prescriptions/state/StoreProvider';

/** The id the layout passes when nobody is signed in; there is nothing to load for it. */
const SIGNED_OUT = 'signed-out';

/** Restore only this account's records before health screens read their initial state. */
export function HealthSessionBoundary({ userId, children }: { userId: string; children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    resetAssessmentSession();
    setPainHistoryAccount(userId);
    // Load both history and prescription at once. loadPrescriptions records a failure instead of throwing, so only a pain-history
    // failure shows this retry screen and a prescriptions failure is shown on the prescriptions screen.
    Promise.all([loadPainHistory(), userId === SIGNED_OUT ? Promise.resolve() : loadPrescriptions(userId)])
      .then(() => {
        if (!active) return;
        // Restore every assessment type that has data so the profile and summaries are complete.
        restoreAssessmentSession();
        setStatus('ready');
      })
      .catch((cause) => {
        // In development, show why the load failed maybe? The message holds has an error code.
        if (__DEV__) console.warn('Health records load failed:', cause instanceof Error ? cause.message : cause);
        if (active) setStatus('error');
      });
    return () => {
      active = false;
      resetAssessmentSession();
      setPainHistoryAccount(SIGNED_OUT);
      clearPrescriptions();
    };
  }, [userId, attempt]);
  if (status === 'ready') return children;
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      {status === 'loading' ? (
        <ActivityIndicator accessibilityLabel="Loading health records" />
      ) : (
        <View>
          <Text>Your health records could not be loaded.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setStatus('loading');
              setAttempt((value) => value + 1);
            }}
          >
            <Text>Retry</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
