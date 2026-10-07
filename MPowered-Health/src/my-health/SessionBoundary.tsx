import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPainHistory, loadPainHistory, setPainHistoryAccount } from '@/shared/health-records/pain-history';
import { markAssessmentCompleted, resetAssessmentSession } from '@/shared/health-records/session';

/** Restore only this account’s records before health screens read their initial state. */
export function HealthSessionBoundary({ userId, children }: { userId: string; children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    resetAssessmentSession();
    setPainHistoryAccount(userId);
    loadPainHistory().then(() => {
      if (!active) return;
      const latest = getPainHistory().at(-1);
      if (latest) markAssessmentCompleted('pain', latest.answers, new Date(latest.completedAt));
      setStatus('ready');
    }).catch(() => { if (active) setStatus('error'); });
    return () => {
      active = false;
      resetAssessmentSession();
      setPainHistoryAccount('signed-out');
    };
  }, [userId, attempt]);
  if (status === 'ready') return children;
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      {status === 'loading' ? <ActivityIndicator accessibilityLabel="Loading health records" /> : (
        <View>
          <Text>Your health records could not be loaded.</Text>
          <Pressable accessibilityRole="button" onPress={() => { setStatus('loading'); setAttempt(value => value + 1); }}>
            <Text>Retry</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
