import { 
  Text, 
  StyleSheet,  
  View,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette } from "@/constants/profile/ui";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { 
  getPainLocationQuestions,
  getPainIntensityQuestions,
  getPainImpactQuestions,
  getPainManagementQuestions,
} from "@/constants/questions/questions";
import { useAuth } from "@/context/authcontext";
import { useQuestions } from "@/hooks/useQuestions";
import { ModalActions, modalStyles } from "@/components/ui/modal-ui";
// temporary UI - to be replaced by settings specific UI
import {
  AuthIntro,
  AuthHeader,
  ChoiceButton,
  PrimaryButton,
  authStyles,
  AuthInput,
} from '@/components/auth/auth-ui';

export default function AddQuestion() {
  const router = useRouter();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<string[]>([]);
  const { createQuestion, painAssessment, retrievePainAssessment, isPainAssessmentLoading } = useQuestions();
  const [isLoading, setIsLoading] = useState(false);

  const toggleQuestions = (question: string) => {
    setQuestions((selected) =>
      selected.includes(question)
        ? selected.filter((item) => item !== question)
        : [...selected, question],
    );
  };

  const painLocationQuestions = getPainLocationQuestions(painAssessment?.pain_location || null);
  const painIntensityQuestions = getPainIntensityQuestions(
    painAssessment?.current_pain || null, 
    painAssessment?.mildest_pain || null,
    painAssessment?.worst_pain || null, 
    painAssessment?.average_pain || null
  );

  const painImpactQuestions = getPainImpactQuestions();
  const painManagementQuestions = getPainManagementQuestions();
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);

  // save questions and send to backend
  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User not authenticated')
      };
      if (!questions.length) {
        Alert.alert('Error', 'Please select at least one question');
        return;
      }
      for (const question of questions) {
        await createQuestion(question);
      };
      // reset questions
      setQuestions([]);
      router.replace('/(tabs)/(questions)/questions');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to complete. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // custom questions
  const [showQuestionPreview, setShowQuestionPreview] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  const handleAddQuestion = () => {
    if (!user) {
      return;
    }
    const trimmedQuestion = customQuestion.trim();
    if (!trimmedQuestion) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // add to custom questions array if no duplicate
      setCustomQuestions((selected) =>
        selected.includes(trimmedQuestion)
          ? selected
          : [...selected, trimmedQuestion],
      );
            
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to complete. Please try again.');
    } finally {
      setIsLoading(false);
      // close modal
      setCustomQuestion('');
      setShowQuestionPreview(!showQuestionPreview);
    }
  }

  useEffect(() => {
    retrievePainAssessment();
  }, [retrievePainAssessment]);

  if (isPainAssessmentLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AuthHeader />
      <View style={styles.body}>
        <View style={styles.content}>
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
            <View style={authStyles.choices}>
              <Text style={styles.sectionTitle}>Other</Text>
              {customQuestions.map((question) => (
                <ChoiceButton
                  key={question}
                  label={question}
                  multiple
                  selected={questions.includes(question)}
                  onPress={() => toggleQuestions(question)}
                />
              ))}
              <PrimaryButton label='Add your own question' onPress={() => {setShowQuestionPreview(!showQuestionPreview)}}/>
            </View>
          </ScrollView>
          <View style={styles.save}>
            <PrimaryButton label="Save" disabled={!questions.length} loading={isLoading} onPress={handleSave} />
          </View>

          <Modal
            visible={showQuestionPreview}
            transparent={true}
            animationType="fade"
            >
            <View style={modalStyles.centredView}>
              <View style={modalStyles.editInterface}>
                <Text style={modalStyles.modalTitle}>Add Question</Text>
                <AuthInput
                  testID="custom-question-input"
                  label="Question"
                  placeholder={'Enter your question'}
                  inputMode="text"
                  autoCorrect={false}
                  value={customQuestion}
                  onChangeText={setCustomQuestion}
                  onSubmitEditing={handleAddQuestion}
                  editable={!isLoading}
                />
                <ModalActions
                  isSaving={isLoading}
                  onCancel={() => setShowQuestionPreview(false)}
                  onSave={() => void handleAddQuestion()}
                />
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: palette.surface 
  },
  body: { 
    flex: 1, 
    backgroundColor: palette.background 
  },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    flex: 1,
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
  loadingScreen: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: palette.background,
  },
});
