import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { submitAssessmentAnswers } from './backend/assessmentDb';


export default function AssessmentScreen({ categoryData, onBack, assessmentId }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  if (!categoryData || !categoryData.questions) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No questions found for this assessment.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={onBack}>
          <Text style={styles.primaryBtnText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQ = categoryData.questions[currentIndex];
  const totalQuestions = categoryData.questions.length;
  const currentAnswer = answers[currentQ.id];
  const [summaryMessage, setSummaryMessage] = useState('');

  // Multi-select handler
  const toggleMultiOption = (option) => {
    const selectedList = currentAnswer || [];
    const exists = selectedList.includes(option);
    const updated = exists
      ? selectedList.filter((item) => item !== option)
      : [...selectedList, option];

    setAnswers((prev) => ({ ...prev, [currentQ.id]: updated }));
  };

  // Single-select handler
  const selectSingleOption = (option) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
  };

  // Direct value handler (score, number, text)
  const setDirectValue = (value) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: value }));
  };

  // Submit handler
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let extraFields = {};

      // runs the attached scoring rule if the category has one
      if (typeof categoryData.calculateScore === 'function') {
        const result = categoryData.calculateScore(answers);
        extraFields = result.extraFields || {};
        if (result.summaryMessage) {
          setSummaryMessage(result.summaryMessage);
        }
      }
      
      // submit assessment asnwer to supabase
      await submitAssessmentAnswers(categoryData.title, answers, extraFields, assessmentId);
      setIsFinished(true);
    } catch (err) {
      console.error('Submission failed:', err);
      Alert.alert('Submission Error', err.message || 'Failed to submit responses.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Next / Finish handler
  const handleNext = () => {
    if (!currentQ.optional) {
      const isMissing =
        currentAnswer === undefined ||
        currentAnswer === '' ||
        (Array.isArray(currentAnswer) && currentAnswer.length === 0);

      if (isMissing) {
        Alert.alert('Required', 'Please answer this question before continuing.');
        return;
      }
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  // -------------------------------------------------------------
  // VIEW: Summary Screen
  // -------------------------------------------------------------
  if (isFinished) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.categoryTitle}>{categoryData.title}</Text>
        <Text style={styles.summaryBadge}>Submission Complete</Text>
        <Text style={styles.summarySubtitle}>
          Here is a summary of the responses recorded:
        </Text>

        {summaryMessage ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackBody}>{summaryMessage}</Text>
          </View>
        ) : null}

        <View style={styles.summaryList}> 
          {categoryData.questions.map((q, idx) => {
            const val = answers[q.id];
            let displayVal = 'No response';

            if (Array.isArray(val) && val.length > 0) {
              displayVal = val.join(', ');
            } else if (val !== undefined && val !== '') {
              displayVal = String(val);
            }

            return (
              <View key={q.id} style={styles.summaryCard}>
                <Text style={styles.summaryQuestionNumber}>Question {idx + 1}</Text>
                <Text style={styles.summaryQuestionPrompt}>{q.prompt}</Text>
                <Text style={styles.summaryAnswerText}>
                  <Text style={styles.summaryAnswerLabel}>Your Answer: </Text>
                  {displayVal}
                </Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onBack}>
          <Text style={styles.primaryBtnText}>Return to Main Menu</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // VIEW: Questions
  // -------------------------------------------------------------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.categoryTitle}>{categoryData.title}</Text>
      <Text style={styles.counter}>
        Question {currentIndex + 1} of {totalQuestions}
      </Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionTitle}>{currentQ.title}</Text>
        <Text style={styles.prompt}>{currentQ.prompt}</Text>
        {currentQ.helper && <Text style={styles.helperText}>{currentQ.helper}</Text>}
      </View>

      {/* MULTI: Options */}
      {currentQ.kind === 'multi' && (
        <View style={styles.verticalList}>
          {currentQ.options?.map((opt) => {
            const isSelected = (currentAnswer || []).includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.rowCard, isSelected && styles.rowCardSelected]}
                onPress={() => toggleMultiOption(opt)}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* SINGLE: Options */}
      {currentQ.kind === 'single' && (
        <View style={styles.verticalList}>
          {currentQ.options?.map((opt) => {
            const isSelected = currentAnswer === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.rowCard, isSelected && styles.rowCardSelected]}
                onPress={() => selectSingleOption(opt)}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* SCORE: 0 to 10 */}
      {currentQ.kind === 'score' && (
        <View style={styles.scoreRowContainer}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isSelected = currentAnswer === num;
            return (
              <TouchableOpacity
                key={num}
                style={[styles.scoreBtn, isSelected && styles.scoreBtnSelected]}
                onPress={() => setDirectValue(num)}
              >
                <Text style={[styles.scoreText, isSelected && styles.scoreTextSelected]}>
                  {num}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* NUMBER: Input */}
      {currentQ.kind === 'number' && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            placeholder="Enter a number..."
            value={currentAnswer !== undefined ? String(currentAnswer) : ''}
            onChangeText={(val) => setDirectValue(val)}
          />
        </View>
      )}

      {/* TEXT: Input */}
      {currentQ.kind === 'text' && (
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            multiline
            numberOfLines={4}
            placeholder="Enter here..."
            textAlignVertical="top"
            value={currentAnswer || ''}
            onChangeText={(val) => setDirectValue(val)}
          />
        </View>
      )}

      {/* Bottom Controls */}
      <TouchableOpacity
        style={[styles.primaryBtn, isSubmitting && styles.primaryBtnDisabled]}
        onPress={handleNext}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.primaryBtnText}>
            {currentIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={onBack}
        disabled={isSubmitting}
      >
        <Text style={styles.cancelBtnText}>Back to Menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  counter: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
  },
  questionCard: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 24,
  },
  helperText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    fontStyle: 'italic',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  verticalList: {
    width: '100%',
    maxWidth: 340,         
    alignSelf: 'center',    
    flexDirection: 'column',
    gap: 10,
    marginBottom: 24,
  },
  rowCard: {
    width: '100%',          
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  scoreRowContainer: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  scoreBtn: {
    flex: 1,                          
    aspectRatio: 0.85,                
    marginHorizontal: 2,              
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBtnSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  scoreTextSelected: {
    color: '#ffffff',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  textArea: {
    height: 110,
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: '#64748b',
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
});