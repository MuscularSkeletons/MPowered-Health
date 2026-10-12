import { 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  View,
  ScrollView,
  Alert} from "react-native";
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
import { useAuth } from "@/context/authcontext";
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
  const { user } = useAuth();

  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleQuestions = (question: string) => {
    setQuestions((selected) =>
      selected.includes(question)
        ? selected.filter((item) => item !== question)
        : [...selected, question],
    );
  };

  const painLocationQuestions = getPainLocationQuestions(null); // TODO
  const painIntensityQuestions = getPainIntensityQuestions(null, null, null, null); // TODO
  const painImpactQuestions = getPainImpactQuestions();
  const painManagementQuestions = getPainManagementQuestions();

  // save questions and send to backend
  const handleSave = () => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User not authenticated')
      };
      if (!questions.length) {
        Alert.alert('Error', 'Please select at least one question');
        return;
      }
      
      router.replace('/(tabs)/(questions)/questions');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to complete. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

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
      <View style={authStyles.choices}>
        <Text style={styles.sectionTitle}>Pain Location</Text>
        {painLocationQuestions.map((question) => (
          <ChoiceButton
            key={question}
            label={question}
            multiple
            selected={questions.includes(question)}
            onPress={() => toggleQuestions(question)}
          />
        ))}
      </View>
      <View style={authStyles.choices}>
        <Text style={styles.sectionTitle}>Pain Intensity</Text>
        {painIntensityQuestions.map((question) => (
          <ChoiceButton
            key={question}
            label={question}
            multiple
            selected={questions.includes(question)}
            onPress={() => toggleQuestions(question)}
          />
        ))}
      </View>
      <View style={authStyles.choices}>
        <Text style={styles.sectionTitle}>Pain Impact</Text>
        {painImpactQuestions.map((question) => (
          <ChoiceButton
            key={question}
            label={question}
            multiple
            selected={questions.includes(question)}
            onPress={() => toggleQuestions(question)}
          />
        ))}
      </View>
      <View style={authStyles.choices}>
        <Text style={styles.sectionTitle}>Management</Text>
        {painManagementQuestions.map((question) => (
          <ChoiceButton
            key={question}
            label={question}
            multiple
            selected={questions.includes(question)}
            onPress={() => toggleQuestions(question)}
          />
        ))}
      </View>
    </ScrollView>
    <View style={styles.save}>
      <PrimaryButton label="Save" disabled={!questions.length} loading={isLoading} onPress={handleSave} />
    </View>

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
  sectionTitle: {
    marginTop: 16, 
    fontSize: 20,
    fontWeight: '600',
    color: palette.text,
  },
  save: {
    marginTop: 10,
  },  
});
