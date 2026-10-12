import { 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  View,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from "react-native";
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
import { useQuestions } from "@/hooks/useQuestions";
// temporary UI - to be replaced by settings specific UI
import {
  AuthIntro,
  AuthScreen,
  ChoiceButton,
  PrimaryButton,
  authStyles,
  AuthInput,
} from '@/components/auth/auth-ui';

export default function AddQuestion() {
  const router = useRouter();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<string[]>([]);
  const { createQuestion } = useQuestions();
  const [isLoading, setIsLoading] = useState(false);

  const toggleQuestions = (question: string) => {
    setQuestions((selected) =>
      selected.includes(question)
        ? selected.filter((item) => item !== question)
        : [...selected, question],
    );
  };

  const painLocationQuestions = getPainLocationQuestions(null); // TODO when integrate with assessments as need access to assessment hook
  const painIntensityQuestions = getPainIntensityQuestions(null, null, null, null); // TODO
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
        animationType="slide"
        >
        <View style={styles.centredView}>
          <View style={styles.editInterface}>
            <Text>Add Question</Text>
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
            <View style={styles.buttonOptions}>
              <Pressable 
                style={[styles.button, styles.buttonCancel]} 
                onPress={() => setShowQuestionPreview(!showQuestionPreview)}
                disabled={isLoading}
                >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.buttonSave]} onPress={handleAddQuestion}>
                <Text>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  centredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editInterface: {
    backgroundColor: 'white',
    margin: 10,
    padding: 50,
    paddingLeft: 100,
    paddingRight: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 20,
  },
  buttonOptions: {
    flexDirection: 'row',
    paddingTop: 20,
  },
  button: {
    borderRadius: 20,
    padding: 15,
    elevation: 2,
    marginHorizontal: 10,
  },
  buttonCancel: {
    backgroundColor: palette.line,
  },
  buttonSave: {
    backgroundColor: palette.primary,
  },
});
