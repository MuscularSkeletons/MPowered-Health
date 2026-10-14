import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/authcontext";
import { useEffect, useState } from "react";

export interface Question {
    id: string;
    user_id: string;
    question: string;
    answer: string | null;
    created_at: string;
    updated_at: string;
}

export const useQuestions = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const loadQuestions = async () => {
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
    };

    useEffect(() => {
        loadQuestions();
    }, []);

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
            const { error, data } = await supabase
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

    return { createQuestion, deleteQuestion, updateAnswer, refreshQuestions, questions };
}