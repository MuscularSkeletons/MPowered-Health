import { styles } from '@/components/forms/styles';
import { AuthHeader } from '@/components/auth/auth-ui';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Wraps a form in the shared page layout and back navigation. */
export function Shell({
  title,
  children,
  onBack = () => router.back(),
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AuthHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
