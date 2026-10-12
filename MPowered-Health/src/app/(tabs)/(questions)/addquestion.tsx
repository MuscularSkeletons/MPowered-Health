import { 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  View,
  ScrollView} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette } from "@/constants/profile/ui";
import { useState } from "react";
import { useRouter } from "expo-router";
import { 
  getPainLocationQuestions,
  getPainIntensityQuestions,
  getPainImpactQuestions,
  getPainManagementQuestions,
} from "@/constants/questions/questions";
// temporary UI - to be replaced by settings specific UI
import {
  AuthIntro,
  AuthScreen,
  ChoiceButton,
  PrimaryButton,
  authStyles,
} from '@/components/auth/auth-ui';

export default function AddQuestion() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
    <Text onPress={() => router.back()} style={authStyles.back}>‹ Back</Text>
    <AuthIntro
        sectionLabel="Questions"
        title="Add Questions"
        description="Questions are generated based on your assessment answers. Please complete your assessments for accurate suggestions."
      />
    <ScrollView>
      <Text>Click the checkbox next to any questions you wish to add to your appointment plan.</Text>
    </ScrollView>
    <PrimaryButton label="Save" onPress={() => router.replace("/(tabs)/(questions)/questions")} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: palette.background,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
  },
});
