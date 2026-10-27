import Questions from "@/app/(tabs)/(questions)/questions";
import { useQuestions } from "@/hooks/useQuestions";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { useFocusEffect } from "expo-router";

const mockHandleAddQuestion = jest.fn();
let mockQuestion : {
    id: string | null,
    user_id : string | null,
    question: string | null,
    answer: string | null,
    created_at: string | null,
    updated_at: string | null,
} = {
    id: '1', 
    user_id: '1',
    question: "What options are available to improve my quality of life?", 
    answer: null, 
    created_at: "01/10/2026", 
    updated_at: "01/10/2026",
}
let mockQuestions = [mockQuestion];
const mockUpdateAnswer = jest.fn();
const mockDeleteQuestions = jest.fn();
const mockRetrievePainAssessment = jest.fn();
const mockRefreshQuestions = jest.fn();
const mockPush = jest.fn();


jest.mock('@/context/authcontext', () => ({
    useAuth: () => ({
        user: jest.fn(),
  }),
}));

//questions hook
jest.mock('@/hooks/useQuestions', () => ({
    useQuestions: () => ({
        questions : mockQuestions,
        updateAnswer : mockUpdateAnswer,
        deleteQuestion: mockDeleteQuestions,
        refreshQuestions: mockRefreshQuestions,
        retrievePainAssessment: mockRetrievePainAssessment,
    }),
}));

//mocking expo router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    useFocusEffect: jest.fn(),
}))


//questions main screen rendering
describe("question main screen", () => {

    beforeEach(()=> {
        jest.clearAllMocks();
    })

    test("objects are rendered correctly (no questions added)", async() => {
        mockQuestions = [],
        await render(<Questions/>);
        expect(screen.getByText("YOUR QUESTIONS")).toBeTruthy();
        expect(screen.getByText("Appointment Preparation")).toBeTruthy();
        expect(screen.getByText("Add questions you would like to discuss with your healthcare professional/s.")).toBeTruthy();
        expect(screen.getByText("No questions created yet. Press the + button to start adding questions!")).toBeTruthy();
        expect(screen.getByText("Supported by ABBVIE"));
    })
})

describe("adding questions", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockQuestions = [mockQuestion];
    })

    test("when a question is added, it appears as a question card", async() => {
        await render (<Questions/>);

        await fireEvent.press(screen.getByText("+"));
        expect(screen.getByText("What options are available to improve my quality of life?")).toBeTruthy();
        expect(screen.getByText("No answer submitted yet")).toBeTruthy();
        expect(screen.getByText("ADD ANSWER")).toBeTruthy();
    })
})

describe("deleting questions", () => {

})

describe("recording answers", () => {

})

//navigation
describe("navigation tests", () => {
    test("pressing + should navigate to add questions page", async() => {
        await render (<Questions/>);
        await fireEvent.press(screen.getByText("+"));
        expect(mockPush).toHaveBeenCalledWith("/(tabs)/(questions)/addquestion");        
    })
})