import { SafeAreaView } from "react-native-safe-area-context";
import { Header, PrimaryButton, commonStyles } from "@/components/shared/common";
import { 
    KeyboardAvoidingView,
    ScrollView,
    View,
    Pressable,
    Text,
    TextInput,
    Platform,
    StyleSheet,
} from "react-native";
import { ScoreSlider } from "@/components/assessment/slider";
import { QuestionItem } from "@/types/assessment";
import { RefObject, Dispatch, SetStateAction } from "react";
import { PrescriptionItem } from "@/types/prescriptions";
import { palette, textInputLength } from "@/constants/ui/styling";
import { router } from "expo-router";
import { asSentence } from "@/utils/convertSentence";

interface AssessmentQuestionProps {
    categoryData: {
        title: string;
        summary?: string;
        questions: QuestionItem[];
        calculateScore?: (answers: Record<string, any>) => any;
    };
    scrollRef: RefObject<ScrollView | null>;
    questions: QuestionItem[];
    currentQ: QuestionItem;
    selectedMulti: string[];
    selectedValue: any;
    isLocationQuestion: boolean;
    currentScore: number;
    otherText: string;
    valid: boolean;
    loadFailed: boolean;
    submitError: string | null;
    isSubmitting: boolean;
    onBack: () => void;
    select: (value: string | number) => void;
    setOtherText: Dispatch<SetStateAction<string>>;
    setCurrentIndex: Dispatch<SetStateAction<number>>;
    currentIndex: number;
    list: PrescriptionItem[];
    currentText: string;
    next: () => void;
    isLast: boolean;
}

const painLabel = (score: number) =>
  score === 0
    ? 'I have no pain at all'
    : score <= 3
      ? 'The pain is very mild'
      : score <= 6
        ? 'The pain is moderate'
        : score <= 8
          ? 'The pain is fairly severe'
          : score === 9
            ? 'The pain is extremely severe'
            : 'The pain is the worst imaginable';

/** Displays assessment question UI according to type */
export function AssessmentQuestion({
    categoryData,
    scrollRef,
    questions,
    currentQ,
    selectedMulti,
    selectedValue,
    isLocationQuestion,
    currentScore,
    otherText,
    valid,
    loadFailed,
    submitError,
    isSubmitting,
    onBack,
    select,
    setOtherText,
    setCurrentIndex,
    currentIndex,
    list,
    currentText,
    next,
    isLast,
}: AssessmentQuestionProps) {
    return (
        <SafeAreaView style={commonStyles.safe} edges={['top']}>
            <Header />
            <KeyboardAvoidingView style={commonStyles.body} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.top}>
                    <Pressable onPress={() => (currentIndex ? setCurrentIndex((index) => index - 1) : onBack())}>
                        <Text style={styles.back}>‹ Back</Text>
                    </Pressable>
                    <Text style={styles.counter}>{currentIndex + 1}/{questions.length}</Text>
                    </View>
                    <View style={styles.progressTrack}>
                    <View
                        style={[
                        styles.progressFill,
                        { width: `${((currentIndex + 1) / questions.length) * 100}%` },
                        ]}
                    />
                    </View>
                    <Text style={styles.module}>{categoryData.title}</Text>
                    <Text style={styles.title}>{currentQ.title}</Text>
                    <Text style={styles.prompt}>{currentQ.prompt}</Text>
        
                    {/* display messages related to status of prescriptions */}   
                    <View>
                    {
                        currentQ.id === 'medication' && loadFailed ? (
                        <Text style={styles.copy}>Your prescriptions could not be loaded.</Text>
                        ) : currentQ.id === 'medication' && list.length === 0 ? (
                        <Text style={styles.copy}>No prescriptions added yet.</Text>
                        ) : null
                    }
                    </View>
        
                    {currentQ.kind === 'score' ? (
                    <>
                        <View style={styles.score}>
                        <Text style={styles.scoreNumber}>
                            {selectedValue === undefined ? '0 to 10' : currentScore}
                        </Text>
                        <Text style={styles.scoreLabel}>
                            {selectedValue === undefined ? 'Slide to select a value' : painLabel(currentScore)}
                        </Text>
                        </View>
                        <ScoreSlider value={currentScore} onChange={select} />
                    </>
                    ) : currentQ.kind === 'text' || currentQ.kind === 'number' ? (
                    <TextInput
                        value={currentText}
                        onChangeText={(text) => select(currentQ.kind === 'number' ? text.replace(/\D/g, '') : text)}
                        keyboardType={currentQ.kind === 'number' ? 'numeric' : 'default'}
                        maxLength={currentQ.kind === 'number' ? 2 : textInputLength.long}
                        multiline={currentQ.kind === 'text'}
                        placeholder={currentQ.kind === 'number' ? 'Input number only' : 'Write your reflection'}
                        placeholderTextColor={palette.muted}
                        style={[styles.input, currentQ.kind === 'text' && styles.textArea]}
                    />
                    ) : ( 
                    <View style={styles.options}>
                        {currentQ.options?.map((option) => {
                        const on = currentQ.kind === 'multi'
                            ? selectedMulti.includes(option)
                            : selectedValue === option;
                        return (
                            <View key={option}>
                            <Pressable
                            
                            onPress={() => select(option)}
                            style={[styles.option, on && styles.optionOn]}
                            >
                            <Text style={[styles.optionText, on && styles.optionTextOn]}>{asSentence(option)}</Text>
                            <View
                                style={[
                                currentQ.kind === 'single' ? styles.radio : styles.box,
                                on && styles.markOn,
                                ]}
                            >
                                <Text style={styles.tick}>{on ? '✓' : ''}</Text>
                            </View>
                            </Pressable>
        
                            {/* pop-up textinput when "Other" is selected */}
                            {isLocationQuestion && option === 'Other' && on ? (
                                <View style={styles.otherInputContainer}>
                                <TextInput
                                    value={otherText}
                                    onChangeText={setOtherText}
                                    placeholder="Please specify location (e.g., Wrist, Elbow)"
                                    placeholderTextColor="#81798A"
                                    style={styles.otherTextInput}
                                    autoFocus
                                    maxLength={textInputLength.short}
                                />
                                </View>
                            ) : null}
                            </View>
                        );
                        })}
                    </View>
                    )}
        
                    <View style={styles.action}>
                    <PrimaryButton
                        label={isSubmitting ? 'Saving…' : isLast ? 'Review' : 'Record'}
                        disabled={!valid || isSubmitting}
                        loading={isSubmitting}
                        onPress={next}
                    />
                    {!valid ? <Text style={styles.required}>This question is mandatory.</Text> : null}
                    {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
                    </View>
                    {currentQ.helper ? <Text style={styles.helper}>{currentQ.helper}</Text> : null}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export function EmptyAssessment({
    onBack = () => router.back(),
}) {
    return (
    <SafeAreaView style={commonStyles.safe} edges={['top']}>
        <Header />
        <View style={styles.empty}>
            <Text style={styles.required}>No questions found for this assessment.</Text>
            <PrimaryButton label="Back to Overview" onPress={onBack} />
        </View>
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        width: '100%',
        maxWidth: 680,
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 120,
    },
    top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    back: { fontSize: 14, fontWeight: '700', color: palette.success, paddingVertical: 12 },
    counter: { fontSize: 12, fontWeight: '700', color: palette.muted },
    progressTrack: {
        height: 5,
        borderRadius: 4,
        backgroundColor: palette.line,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 26,
    },
    progressFill: { height: '100%', borderRadius: 4, backgroundColor: palette.success },
    module: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.1,
        color: palette.primary,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '800',
        letterSpacing: -0.6,
        color: palette.text,
        marginTop: 8,
    },
    prompt: { fontSize: 15, lineHeight: 22, color: palette.muted, marginTop: 9 },
    helper: {
        fontSize: 12,
        lineHeight: 18,
        color: palette.muted,
        marginTop: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: palette.accentSoft,
        borderWidth: 1,
        borderColor: palette.accent,
        borderRadius: 12,
    },
    options: { gap: 12, marginTop: 24 },
    option: {
        minHeight: 64,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: palette.line,
        backgroundColor: palette.surface,
        paddingHorizontal: 18,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionOn: { backgroundColor: palette.secondary, borderColor: palette.success },
    optionText: { flex: 1, fontSize: 14, lineHeight: 20, color: palette.text, paddingRight: 10 },
    optionTextOn: { fontWeight: '700' },
    box: {
        width: 24,
        height: 24,
        borderWidth: 1.5,
        borderColor: palette.controlBorder,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radio: {
        width: 24,
        height: 24,
        borderWidth: 1.5,
        borderColor: palette.controlBorder,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markOn: { backgroundColor: palette.success, borderColor: palette.success },
    tick: { color: palette.surface, fontSize: 13, fontWeight: '800' },
    score: {
        backgroundColor: palette.accentSoft,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginTop: 26,
    },
    scoreNumber: { fontSize: 38, fontWeight: '800', color: palette.success },
    scoreLabel: { fontSize: 13, color: palette.muted, marginTop: 7 },
    input: {
        minHeight: 58,
        borderWidth: 1,
        borderColor: palette.line,
        borderRadius: 18,
        backgroundColor: palette.surface,
        padding: 16,
        fontSize: 15,
        color: palette.text,
        textAlignVertical: 'top',
        marginTop: 24,
    },
    textArea: { minHeight: 150 },
    action: { marginTop: 28 },
    submitError: {
        marginTop: 10,
        fontSize: 12,
        lineHeight: 18,
        color: palette.error,
        textAlign: 'center',
    },
    guideButton: {
        minHeight: 54,
        backgroundColor: palette.accentSoft,
        borderTopWidth: 1,
        borderTopColor: palette.accent,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    guideIcon: { fontSize: 19, fontWeight: '800', color: palette.text },
    guideText: { fontSize: 13, fontWeight: '800', color: palette.text },
    guideArrow: { fontSize: 22, color: palette.text },
    otherInputContainer: {
        marginTop: 8,
        marginBottom: 6,
        paddingHorizontal: 4,
    },
    otherTextInput: {
        borderWidth: 1.5,
        borderColor: palette.primary,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: palette.text,
        backgroundColor: palette.surface,
    },
    copy: {
        fontSize: 15,
        lineHeight: 23,
        color: palette.muted,
        marginTop: 40,
        fontStyle: 'italic',
    },
    required: { fontSize: 12, fontWeight: '400', color: palette.text, textAlign: 'center', marginTop: 10 },
    empty: { flex: 1, justifyContent: 'center', padding: 24, gap: 18 },  
});