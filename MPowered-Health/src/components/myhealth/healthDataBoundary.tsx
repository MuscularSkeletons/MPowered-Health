import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  clearHealthRecords,
  loadHealthRecords,
  setHealthRecordsAccount,
} from '@/services/healthDataHelper';
import { clearPrescriptions, loadPrescriptions } from '@/context/prescriptionsContext';

/** The id the layout passes when nobody is signed in; there is nothing to load for it. */
const SIGNED_OUT = 'signed-out';

/** Restore only this account's records before health screens read their initial state. */
export function HealthDataBoundary({ userId, children }: { userId: string; children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setHealthRecordsAccount(userId);
    // Load both history and prescription at once. loadPrescriptions records a failure instead of throwing, so only a pain-history
    // failure shows this retry screen and a prescriptions failure is shown on the prescriptions screen.
    Promise.all([loadHealthRecords(), userId === SIGNED_OUT ? Promise.resolve() : loadPrescriptions(userId)])
      .then(() => {
        if (!active) return;
        setStatus('ready');
      })
      .catch((cause) => {
        // In development, show why the load failed maybe? The message holds has an error code.
        if (__DEV__) console.warn('Health records load failed:', cause instanceof Error ? cause.message : cause);
        if (active) setStatus('error');
      });
    return () => {
      active = false;
      setHealthRecordsAccount(SIGNED_OUT);
      clearHealthRecords();
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
