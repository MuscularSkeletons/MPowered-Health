import { 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette } from "@/constants/profile/ui";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Question, useQuestions } from "@/hooks/useQuestions";
import { useAuth } from "@/context/authcontext";
import { formatTimeAgo } from "@/lib/date-helper";
// temporary UI - to be replaced by settings specific UI
import {
  AuthIntro,
  AuthScreen,
  ChoiceButton,
  PrimaryButton,
  authStyles,
} from '@/components/auth/auth-ui';

interface QuestionCardProps {
  question: Question;
  currentUserId?: string;
}
const QuestionCard = ({question, currentUserId}: QuestionCardProps) => { 
  const handleAnswer = () => {

  }

  return (
    <View style={styles.questionContainer}>
      <View style={styles.questionHeader}>
        <View style={styles.timeInfo}>
          <View>
            <Text style={styles.timeAgo}>
              { question.created_at === question.updated_at ? `created ${formatTimeAgo(question.created_at)}` : `edited ${formatTimeAgo(question.updated_at)}` }
            </Text>
          </View>
        </View>
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
        <PrimaryButton label={question.answer ? 'Edit answer' : 'Add Answer'} onPress={handleAnswer}/>
      </View>
    </View>
  )
}

export default function Questions() {
  const router = useRouter();
  const { user } = useAuth();
  const { questions } = useQuestions();

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
      <FlatList data={questions} renderItem={renderQuestion}/>

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
});
