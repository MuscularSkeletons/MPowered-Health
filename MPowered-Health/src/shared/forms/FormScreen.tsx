import { s } from '@/shared/forms/styles';
import { MhaHeader } from '@/shared/ui/mha-ui';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={s.safe} edges={['top']}>
      <MhaHeader />
      <ScrollView contentContainerStyle={s.content}>
        <Pressable onPress={onBack}>
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <Text style={s.title}>{title}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
