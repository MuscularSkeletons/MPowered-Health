/** Defines question data structure from backend questions table */
export interface Question {
    id: string;
    user_id: string;
    question: string;
    answer: string | null;
    created_at: string;
    updated_at: string;
}