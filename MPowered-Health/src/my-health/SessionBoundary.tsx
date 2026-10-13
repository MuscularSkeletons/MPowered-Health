import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AssessmentId } from '@/shared/health-records/assessment-types';
import {
  getLatestAssessmentAnswers,
  loadPainHistory,
  setPainHistoryAccount,
} from '@/shared/health-records/pain-history';
import { markAssessmentCompleted, resetAssessmentSession } from '@/shared/health-records/session';
import { clearPrescriptions, loadPrescriptions } from '@/my-health/prescriptions/state/StoreProvider';

/** The id the layout passes when nobody is signed in so there's nothing to load for it. */
const SIGNED_OUT = 'signed-out';

/** Restore only this account's records before health screens read their initial state. */
export function HealthSessionBoundary({ userId, children }: { userId: string; children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    resetAssessmentSession();
    setPainHistoryAccount(userId);
    // Load history and prescriptions together so if either fails the user gets one retry screen.
    Promise.all([loadPainHistory(), userId === SIGNED_OUT ? Promise.resolve() : loadPrescriptions(userId)])
      .then(() => {
        if (!active) return;
        // Restore every assessment type that has data so the profile and summaries are complete.
        const latest = getLatestAssessmentAnswers();
        (Object.keys(latest) as AssessmentId[]).forEach((type) => {
          const entry = latest[type]!;
          markAssessmentCompleted(type, entry.answers, new Date(entry.completedAt));
        });
        setStatus('ready');
      })
      .catch(() => {
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
