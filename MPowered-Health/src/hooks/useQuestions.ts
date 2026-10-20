import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/authcontext";
import { useState, useCallback } from "react";
import { getCurrentWeekStartDate } from '@/hooks/useAssessments';
import { type Question } from "@/types/questions";
import { type PainAssessment } from "@/types/assessment";


export const useQuestions = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const loadQuestions = useCallback(async () => {
        if (!user) {
            return;
        }

        setIsLoading(true);
        try {
            const {data: questionsData, error: questionsError } = await supabase
            .from("question")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });

            if (questionsError) {
                console.error("Error loading questions:", questionsError);
                throw questionsError;
            }

            if (!questionsData || questionsData.length === 0) {
                setQuestions([]);
                return;
            }

            const formattedQuestions: Question[] = questionsData.map((question) => ({
                id: question.question_id,
                user_id: question.user_id,
                question: question.question,
                answer: question.answer || null,
                created_at: question.created_at,
                updated_at: question.updated_at,
            }));

            setQuestions(formattedQuestions);
        } catch (error) {
            console.error("Error loading questions:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const createQuestion = async (question: string) => {
        if (!user) {
            throw new Error("User not authenticated");
        }

        try {
            const {error} = await supabase.from("question").insert({
                user_id: user.id,
                question: question,
            })
            .select()
            .single();

            if (error) {
                console.error("Error creating question:", error);
                throw error;
            }

            // refresh posts
            await loadQuestions();
        
        } catch (error) {
            console.error("Error creating question:", error);
            throw error;
        }
    };

    const deleteQuestion = async (questionId: string) => {
        if (!user) {
            throw new Error("User not authenticated");
        }

        try {
            const {error} = await supabase
            .from("question")
            .delete()
            .match({
                question_id: questionId
            })
            .select()
            .single();

            if (error) {
                console.error("Error deleting question:", error);
                throw error;
            }

            // refresh posts
            await loadQuestions();
        
        } catch (error) {
            console.error("Error deleting question:", error);
            throw error;
        }   
    };

    const updateAnswer = async (questionId: string, answer: string) => {
        if (!user) {
            throw new Error("User not authenticated");
        }

        if (!answer) {
            console.error("No answer to submit");
        }

        try {
            const { error } = await supabase
                .from("question")
                .update({
                    answer: answer,
                    updated_at: new Date().toISOString(),
                })
                .eq("question_id", questionId)
                .select()
                .single();

            if (error) {
                console.error("Error updating answer:", error);
                throw error;
            }

            // refresh posts
            await loadQuestions();
        
        } catch (error) {
            console.error("Error updating answer:", error);
            throw error;
        }
    }

    const refreshQuestions = async () => {
        await loadQuestions();
    };
    
    // retrieve the current week's assessment id or return null
    const getCurrentWeeklyAssessmentID = useCallback(async (): Promise<string | null> => {
        if (!user) {
            throw new Error("User not authenticated");
        }
        const weekStart = getCurrentWeekStartDate();
        try {
            const { data, error } = await supabase
                .from('assessment')
                .select('assessment_id')
                .eq('week_start', weekStart)
                .eq('user_id', user.id)
                .maybeSingle();        
            if (error) {
                console.error('Error fetching assessment ID:', error);
                return null;
            }
            if (data) {
                return data.assessment_id;
            }
            return null;
        } catch (error) {
            console.error('Error retrieving assessment ID:', error);
            return null;
        }
    }, [user]);

    const [painAssessment, setPainAssessment] = useState<PainAssessment | null>(null); 
    const [isPainAssessmentLoading, setIsPainAssessmentLoading] = useState(false);
    
    // retrieve pain assessment data or if incomplete return null 
    const retrievePainAssessment = useCallback(async () => {
        if (!user) {
            throw new Error("User not authenticated");
        }
        setIsPainAssessmentLoading(true);
        try {
            const assessmentID = await getCurrentWeeklyAssessmentID();
            console.log(assessmentID);
            if (assessmentID === null) {
                console.log("No pain assessment completed this week");
                setPainAssessment(null);
                return;
            }
            const {data: painAssessmentData, error: painAssessmentError } = await supabase
            .from("pain_assessment")
            .select("*")
            .eq("assessment_id", assessmentID)
            .single();
            if (painAssessmentError) {
                console.error("Error retrieving pain assessment data:", painAssessmentError);
                setPainAssessment(null);
                return;
            }
            if (!painAssessmentData) {
                console.log("No pain assessment completed this week");
                setPainAssessment(null);
                return;
            }
            
            const formattedPainAssessment: PainAssessment = ({
                pain_location: painAssessmentData.pain_location,
                worst_pain: painAssessmentData.worst_pain,
                mildest_pain: painAssessmentData.mildest_pain,
                average_pain: painAssessmentData.average_pain,
                current_pain: painAssessmentData.current_pain,
            });
            setPainAssessment(formattedPainAssessment);
            
        } catch (error) {
            console.error("Error retrieving pain assesment data:", error);
            setPainAssessment(null);
            return;
        } finally {
            setIsPainAssessmentLoading(false);
        }
    }, [getCurrentWeeklyAssessmentID, user]);


    return { 
        createQuestion, 
        deleteQuestion, 
        updateAnswer, 
        refreshQuestions, 
        questions,
        retrievePainAssessment, 
        painAssessment, 
        isPainAssessmentLoading, 
        isLoading,
    };
}