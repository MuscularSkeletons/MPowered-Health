import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/authcontext";

export const useQuestions = () => {
  const { user } = useAuth();

  const createQuestion = async (question: string) => {
    if (!user) {
        throw new Error("User not authenticated");
    }

    try {
        const {error} = await supabase.from("Question").insert({
            user_id: user.id,
            question: question,
        })
        .select()
        .single();
    
    } catch (error) {
        console.error("Error creating question:", error);
    }
  };

  return { createQuestion };
}