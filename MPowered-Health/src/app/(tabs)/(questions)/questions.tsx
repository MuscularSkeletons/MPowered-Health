import { 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  View,
  Alert,
  Modal,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette } from "@/constants/ui/styling";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Question, useQuestions } from "@/hooks/useQuestions";
import { useAuth } from "@/context/authcontext";
import { formatTimeAgo } from "@/lib/date-helper";
import { Ionicons } from "@expo/vector-icons";
import { ModalActions, modalStyles } from '@/components/ui/modal-ui';
import {
  Intro,
  Header,
  PrimaryButton,
  Input,
} from '@/components/ui/common';

interface QuestionCardProps {
  question: Question;
  onDelete: (questionId: string) => Promise<void>;
  onUpdate: (questionId: string, answer: string) => Promise<void>;
}
const QuestionCard = ({question, onDelete, onUpdate}: QuestionCardProps) => { 

  const { user } = useAuth();
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
          setIsLoading(true);
          try {
            await onDelete(question.id);
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "Error deleting question. Please refresh and try again");
          } finally {
            setIsLoading(false);
          }
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
      await onUpdate(question.id, trimmedAnswer);
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
          <TouchableOpacity onPress={handleDelete} disabled={isLoading}>
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
          <PrimaryButton label={question.answer ? 'Edit answer' : 'Add Answer'} onPress={() => {setShowAnswerPreview(!showAnswerPreview)}} disabled={isLoading}/>
        </View>
      </View>

      <Modal
          visible={showAnswerPreview}
          transparent={true}
          animationType="fade"
          >
          <View style={modalStyles.centredView}>
            <View style={modalStyles.editInterface}>
              <Text style={modalStyles.modalTitle}>{question.question}</Text>
              <Input
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
              <ModalActions
                isSaving={isLoading}
                onCancel={() => setShowAnswerPreview(false)}
                onSave={() => void handleAnswer()}
              />
            </View>
          </View>
        </Modal>
    </View>
  )
}

export default function Questions() {
  const router = useRouter();
  const { user } = useAuth();
  const { questions, updateAnswer, deleteQuestion, refreshQuestions, retrievePainAssessment } = useQuestions();

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshQuestions();
    }, [refreshQuestions]),
  );

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

  const [isLoading, setIsLoading] = useState(false);

  const handleAddQuestion = async () => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      await retrievePainAssessment();
      router.push("/(tabs)/(questions)/addquestion");
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Fetching pain data.');
    } finally {
      setIsLoading(false);
    }
  }

  const renderQuestion = ({item}: {item: Question}) => (
    <QuestionCard question={item} onDelete={deleteQuestion} onUpdate={updateAnswer}></QuestionCard>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header />
      <View style={styles.body}>
        <View style={styles.content}>
          <Intro
            sectionLabel="YOUR QUESTIONS"
            title="Appointment Preparation"
            description="Add questions you would like to discuss with your healthcare professional/s."
          />

          {/* render questions */}
          <FlatList 
            data={questions} 
            renderItem={renderQuestion} 
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              questions.length === 0 ? styles.emptyContent : styles.qaContent
            }
            ListEmptyComponent={<Text style={styles.emptyContentText}>No questions created yet. Press the + button to start adding questions!</Text>}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
          />     

          <TouchableOpacity style={styles.addButton} onPress={() => handleAddQuestion()} disabled={isLoading}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
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
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    flex: 1,
  },
  qaContent: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 112,
  },
  emptyContent: {
    alignItems: "center",
    borderRadius: 28,
    backgroundColor: palette.light,
    overflow: "hidden",
    padding: 16,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',

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
});
