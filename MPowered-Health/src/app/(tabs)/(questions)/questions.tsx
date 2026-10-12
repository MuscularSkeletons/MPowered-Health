import { 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  View,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette } from "@/constants/profile/ui";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Question, useQuestions } from "@/hooks/useQuestions";
import { useAuth } from "@/context/authcontext";
import { formatTimeAgo } from "@/lib/date-helper";
import { Ionicons } from "@expo/vector-icons";
// temporary UI - to be replaced by settings specific UI
import {
  AuthIntro,
  AuthScreen,
  ChoiceButton,
  PrimaryButton,
  authStyles,
  AuthInput,
} from '@/components/auth/auth-ui';

interface QuestionCardProps {
  question: Question;
  currentUserId?: string;
}
const QuestionCard = ({question, currentUserId}: QuestionCardProps) => { 

  const { user } = useAuth();
  const { updateAnswer, deleteQuestion } = useQuestions();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = () => {
    Alert.alert("Delete Question", "Are you sure you want to delete this question?", [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          console.log("Deleted a question");
          await deleteQuestion(question.id);
        },
        style: 'destructive',
      }
    ])
  }

  const [showAnswerPreview, setShowAnswerPreview] = useState(false);
  const [answer, setAnswer] = useState('');
  const handleAnswer = async () => {
    if (!user) {
      return;
    }
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // update supabase
      await updateAnswer(question.id, trimmedAnswer);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to complete. Please try again.');
    } finally {
      setIsLoading(false);
      // close modal
      setShowAnswerPreview(!showAnswerPreview);
    }
  }

  return (
    <View>
      <View style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <View style={styles.timeInfo}>
            <Text style={styles.timeAgo}>
              { 
                question.created_at === question.updated_at 
                ? `created ${formatTimeAgo(question.created_at)}` 
                : `edited ${formatTimeAgo(question.updated_at)}` 
              }
            </Text>
          </View>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons 
              name={"trash-outline"}
              style={styles.delete}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.questionContent}>
          <View style={styles.question}>
              <Text style={styles.questionText}>{question.question}</Text>
          </View>  
          <View style={styles.answer}>
            <Text style={styles.answerText}>{ question.answer || "No answer submitted yet"}</Text>
        </View>
        </View>
        <View style={styles.answerButton}>
          <PrimaryButton label={question.answer ? 'Edit answer' : 'Add Answer'} onPress={() => {setShowAnswerPreview(!showAnswerPreview)}}/>
        </View>
      </View>

      <Modal
          visible={showAnswerPreview}
          transparent={true}
          animationType="slide"
          >
          <View style={styles.centredView}>
            <View style={styles.editInterface}>
              <Text>{question.question}</Text>
              <AuthInput
                testID="answer-input"
                label="Answer"
                placeholder={'Enter your answer'}
                inputMode="text"
                autoCorrect={false}
                value={answer}
                onChangeText={setAnswer}
                onSubmitEditing={handleAnswer}
                editable={!isLoading}
              />
              <View style={styles.buttonOptions}>
                <Pressable 
                  style={[styles.button, styles.buttonCancel]} 
                  onPress={() => setShowAnswerPreview(!showAnswerPreview)}
                  disabled={isLoading}
                  >
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.buttonSave]} onPress={handleAnswer}>
                  <Text>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
    </View>
  )
}

export default function Questions() {
  const router = useRouter();
  const { user } = useAuth();
  const { questions, refreshQuestions } = useQuestions();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshQuestions();
    } catch (error) {
      console.error("Error refreshing questions", error);
    } finally {
      setRefreshing(false);
    }
  }

  const renderQuestion = ({item}: {item: Question}) => (
    <QuestionCard question={item} currentUserId={user?.id}></QuestionCard>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AuthIntro
        sectionLabel="Q&A"
        title="Questions & Answers"
        description="Add questions you would like to discuss with your healthcare professional/s."
      />

      {/* render questions */}
      <FlatList 
        data={questions} 
        renderItem={renderQuestion} 
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          questions.length === 0 ? styles.emptyContent : styles.content
        }
        ListEmptyComponent={<Text style={styles.emptyContentText}>No questions created yet. Press the + button to start adding questions!</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
      />     

      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/(tabs)/(questions)/addquestion")}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
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
  title: {
    marginTop: 8, 
    fontSize: 29, 
    lineHeight: 36, 
    fontWeight: '800', 
    letterSpacing: -0.6, 
    color: palette.text
  },
  description: {
    marginTop: 10, 
    fontSize: 15, 
    lineHeight: 23, 
    color: palette.muted
  },
  addButton: {
    position: "absolute",
    bottom: 104,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.secondary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: palette.text,
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 32,
  },
  content: {
    paddingBottom: 100,
  },
  emptyContent: {
    alignItems: "center",
    borderRadius: 28,
    backgroundColor: palette.light,
    overflow: "hidden",
    padding: 16,

  },
  emptyContentText: {
    fontSize: 16,
    color: palette.text,
    fontStyle: "italic",
  },
  questionContainer: {
    backgroundColor: palette.light,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  questionContent: {
    paddingHorizontal: 16,
  },
  question: {
    paddingBottom: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  answer: {},
  answerText: {},
  timeInfo: {
    padding: 16,
  },
  timeAgo: {
    color: palette.muted,
    fontSize: 12,

  },
  answerButton: {
    padding: 10,
  },
  delete: {
    fontSize: 20,
    paddingRight: 5,
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
