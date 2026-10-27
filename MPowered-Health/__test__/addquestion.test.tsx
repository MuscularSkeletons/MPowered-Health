import AddQuestion from "@/app/(tabs)/(questions)/addquestion";
import { fireEvent, render, screen } from "@testing-library/react-native";

let mockAssessment: {
    pain_location: string[] | null,
    current_pain: number | null,
    mildest_pain: number | null,
    worst_pain: number | null,
    average_pain: number | null
} = {
    pain_location: ['Head', 'Neck'],
    current_pain: 5,
    mildest_pain: 2,
    worst_pain: 8,
    average_pain: 6,
};

const mockCreateQuestion = jest.fn();
const mockRetrievePainAssessment = jest.fn();
const mockAssessmentLoading = false;

jest.mock('@/context/authcontext', () => ({
    useAuth: () => ({
    user: jest.fn(),
  }),
}));

//questions hook
jest.mock('@/hooks/useQuestions', () => ({
    useQuestions: () => ({
        createQuestion: mockCreateQuestion,
        painAssessment: mockAssessment,
        retrievePainAssessment: mockRetrievePainAssessment,
        isPainAssessmentLoading: mockAssessmentLoading,
    }),
}));



//add question screen rendering
describe("add question screen", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        mockAssessment = {
            pain_location: ['Head', 'Neck'],
            current_pain: 5,
            mildest_pain: 2,
            worst_pain: 8,
            average_pain: 6,
        }
    })
    
    test("objects are rendered correctly", async() => {

        await render(<AddQuestion/>);
        expect(screen.getByText("QUESTIONS")).toBeTruthy();
        expect(screen.getByText("Add Questions")).toBeTruthy();
        expect(screen.getByText("Questions are generated based on your assessment answers. Please complete your assessments for accurate suggestions.")).toBeTruthy();
        expect(screen.getByText("Click the checkbox next to any questions you wish to add to your appointment plan.")).toBeTruthy();
        expect(screen.getByText("Pain Location")).toBeTruthy();
        expect(screen.getByText("Pain Intensity")).toBeTruthy();
        expect(screen.getByText("Pain Impact")).toBeTruthy();
        expect(screen.getByText("Management")).toBeTruthy();
        expect(screen.getByText("Other")).toBeTruthy();
        expect(screen.getByText("Add your own question")).toBeTruthy();
        expect(screen.getByText("Save")).toBeTruthy();
    })

    test("default questions", async() => {
        mockAssessment = {
            pain_location: null,
            current_pain: null,
            mildest_pain: null,
            worst_pain: null,
            average_pain: null,
        }

        await render(<AddQuestion/>);
        expect(screen.getByText("What could be causing my pain?")).toBeTruthy();
        expect(screen.getByText("Could pain in different areas be related, or are they likely separate issues?")).toBeTruthy();
        expect(screen.getByText('Even though I don\'t have pain right now, if I\'ve had severe pain at times, what could explain these flare-ups?')).toBeTruthy();
        expect(screen.getByText('Is it normal for pain to vary between mild and very severe?')).toBeTruthy();
        expect(screen.getByText('What can I do to better manage days when the pain is high?')).toBeTruthy();
        expect(screen.getByText('What treatments or therapies could help improve my mobility?')).toBeTruthy();
        expect(screen.getByText('Would physiotherapy or a specific exercise program be appropriate for me?')).toBeTruthy();
        expect(screen.getByText('Are there movements or activities I should avoid right now?')).toBeTruthy();
        expect(screen.getByText('My pain is making it hard to take care of myself independently — what can we do to improve this?')).toBeTruthy();
        expect(screen.getByText('Are there strategies, aids, or supports that could help with daily tasks?')).toBeTruthy();
        expect(screen.getByText('Should we adjust my treatment plan given how much this is affecting my independence?')).toBeTruthy();
        expect(screen.getByText('Is this level of impact typical for my condition?')).toBeTruthy();
        expect(screen.getByText('What options are available to improve my quality of life?')).toBeTruthy();
        expect(screen.getByText('Are there additional investigations or referrals that might help?')).toBeTruthy();
        expect(screen.getByText('How can I prevent the pain from becoming severe again?')).toBeTruthy();
        expect(screen.getByText('What are realistic goals for improving my function and independence?')).toBeTruthy();
        
    })

    test("questions with info from assessments", async() => {
        await render(<AddQuestion/>);
        expect(screen.getByText("What could be causing pain in my head and neck?")).toBeTruthy();
        expect(screen.getByText("Is pain in my head and neck be related, or are they likely separate issues?")).toBeTruthy();
        expect(screen.getByText("My average pain over the past week has been around 6 — what does this indicate?")).toBeTruthy();
        expect(screen.getByText("Even though I don\'t have pain right now, I\'ve had severe pain at times (up to 8). What could explain these flare-ups?")).toBeTruthy();
        expect(screen.getByText("Is it normal for pain to vary between mild (2) and very severe (8)?")).toBeTruthy();
    })
})

//selecting questions

//default questions

//questions from assessment

//custom questions

//navigation

