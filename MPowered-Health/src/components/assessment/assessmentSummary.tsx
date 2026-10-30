import { SafeAreaView } from "react-native-safe-area-context";
import { 
    ScrollView,
    View,
    Text,
    Pressable, 
    StyleSheet,
} from "react-native";
import { Header, commonStyles } from "@/components/shared/common";
import { QuestionItem } from "@/types/assessment";
import { palette } from "@/constants/ui/styling";
import { asSentence } from "@/utils/convertToSentence";

interface AssessmentSummaryProps {
  categoryData: {
    title: string;
    summary?: string;
    questions: QuestionItem[];
    calculateScore?: (answers: Record<string, any>) => any;
  };
  questions: QuestionItem[];
  answers: Record<string, any>;
  existingAnswers: Record<string, any>;
  summaryMessage: string| null;
  onBack: () => void;
  onEdit: () => void;
}

function currentPeriod() {
  const start = new Date();
  const day = start.getDay();
  start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startMonth = start.toLocaleDateString('en-AU', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-AU', { month: 'short' });
  const range =
    startMonth === endMonth
      ? `${start.getDate()}–${end.getDate()} ${endMonth}`
      : `${start.getDate()} ${startMonth}–${end.getDate()} ${endMonth}`;

  return `Period: ${range}`;
}

/** Displays the assessment summary page */
export function AssessmentSummary({
    categoryData,
    questions,
    answers,
    existingAnswers,
    summaryMessage,
    onEdit,
    onBack,
}: AssessmentSummaryProps) {
    const calculated = categoryData.calculateScore?.(answers);
    const insight =
        summaryMessage ||
        calculated?.summaryMessage ||
        existingAnswers?.impact_level ||
        answers?.impact_level ||
        null;
    const grouped = questions.reduce<Record<string, QuestionItem[]>>((result, question) => {
        (result[question.title] ||= []).push(question);
        return result;
    }, {});
    return (
        <SafeAreaView style={commonStyles.safe} edges={['top']}>
        <Header />
        <ScrollView style={commonStyles.body} contentContainerStyle={styles.summary}>
            <Text style={styles.summaryTitle}>{categoryData.title} Summary</Text>
            <Text style={styles.summaryCopy}>
            {categoryData.summary || 'This helps guide your treatment and support your recovery.'}
            </Text>
            <View style={styles.resultCard}>
            <View style={styles.summaryMeta}>
                <Text style={styles.resultHeading}>{categoryData.title}</Text>
                <Text style={styles.period}>{currentPeriod()}</Text>
            </View>
            {insight ? (
                <View style={styles.summaryInsight}>
                <View style={styles.summaryStatement}>
                    <Text style={styles.summaryStatementText}>{insight}</Text>
                </View>
                </View>
            ) : null}
            {Object.entries(grouped).map(([title, group], index) => (
                <View key={title} style={[styles.resultSection, index > 0 && styles.resultSectionBorder]}>
                <Text style={styles.resultSectionTitle}>{title}</Text>
                {group.map((question) => {
                    const answer = answers[question.id];
                    const text = Array.isArray(answer)
                    ? answer.map(asSentence).join('\n')
                    : answer === undefined || answer === '' || answer === null
                        ? 'No response'
                        : asSentence(String(answer));
                    return (
                    <View key={question.id} style={styles.resultItem}>
                        <Text style={styles.resultLabel}>{question.prompt}</Text>
                        <Text style={styles.result}>{text}</Text>
                    </View>
                    );
                })}
                </View>
            ))}
            </View>
            <View style={styles.summaryFooter}>
            <Text style={styles.saved}>Your answers have been saved.</Text>
            <Pressable
                style={styles.closeButton}
                onPress={onEdit}
            >
                <Text style={styles.closeText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={onBack}>
                <Text style={styles.closeText}>Close</Text>
            </Pressable>
            </View>
        </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    summary: {
        width: '100%',
        maxWidth: 680,
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 110,
    },
    summaryTitle: { fontSize: 30, fontWeight: '800', color: palette.text },
    summaryCopy: { fontSize: 15, lineHeight: 22, color: palette.muted, marginTop: 8 },
    resultCard: { backgroundColor: palette.surface, borderRadius: 22, padding: 20, marginVertical: 24 },
    summaryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    },
    resultHeading: { fontSize: 16, lineHeight: 20, fontWeight: '800', color: palette.text },
    summaryInsight: {
        marginBottom: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: palette.accent,
        overflow: 'hidden',
    },
    summaryStatement: {
        backgroundColor: palette.accentSoft,
        paddingHorizontal: 18,
        paddingVertical: 22,
    },
    summaryStatementText: {
        fontSize: 14,
        lineHeight: 21,
        fontWeight: '600',
        color: palette.text,
        textAlign: 'center',
    },
    summaryFooter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    period: { fontSize: 12, lineHeight: 20, fontWeight: '700', color: palette.primary },
    saved: { fontSize: 12, fontWeight: '700', color: palette.success, flex: 1 },
    closeButton: {
        minWidth: 96,
        minHeight: 42,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: palette.line,
        backgroundColor: palette.surface,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    closeText: { fontSize: 13, fontWeight: '800', color: palette.text },
    resultSection: { paddingVertical: 10 },
    resultSectionBorder: { borderTopWidth: 1, borderTopColor: palette.line, paddingTop: 18 },
    resultSectionTitle: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: '800',
        color: palette.primary,
        marginBottom: 10,
    },
    resultItem: { marginBottom: 10 },
    resultLabel: { fontSize: 13, lineHeight: 19, fontWeight: '700', color: palette.text },
    result: { fontSize: 13, lineHeight: 20, color: palette.text, marginTop: 3 },
});