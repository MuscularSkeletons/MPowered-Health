import AddQuestion from "@/app/(tabs)/(questions)/addquestion";
import { fireEvent, render, screen, userEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

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
const mockReplace = jest.fn();
const mockBack = jest.fn();

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

//mocking expo router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        replace: mockReplace,
        back: mockBack,
    })
}))

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

//selection + button tests
describe("save button is enabled/disabled", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("save button is disabled if no question is selected", async() => {
        await render(<AddQuestion/>);
        expect(screen.getByRole("button", {name: "Save"})).toBeDisabled();
    })

    test("save button is enabled if a question is selected", async() => {
        await render(<AddQuestion/>);
        await fireEvent.press(screen.getByText('What can I do to better manage days when the pain is high?'));        
        expect(screen.getByRole("button", {name: "Save"})).toBeEnabled();
    })

    test("save button is enabled if multiple questions are selected", async() => {
        await render(<AddQuestion/>);
        await fireEvent.press(screen.getByText('What can I do to better manage days when the pain is high?'));
        await fireEvent.press(screen.getByText('How can I prevent the pain from becoming severe again?'));
        expect(screen.getByRole("button", {name: "Save"})).toBeEnabled();
    })

    test("deselecting a question should disable the save button", async() => {
        await render(<AddQuestion/>);
        await fireEvent.press(screen.getByText('What can I do to better manage days when the pain is high?'));        
        expect(screen.getByRole("button", {name: "Save"})).toBeEnabled();
        await fireEvent.press(screen.getByText('What can I do to better manage days when the pain is high?'));        
        expect(screen.getByRole("button", {name: "Save"})).toBeDisabled();      
    })
})

//custom questions
describe("custom question functionality", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing on add question button should open a pop up", async() => {
        await render(<AddQuestion/>);
        await fireEvent.press(screen.getByRole("button", {name: "Add your own question"}));
        expect(screen.getByText("Add Question")).toBeTruthy();
        expect(screen.getByText("Question")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter your question")).toBeTruthy();
        expect(screen.getByText("Cancel")).toBeTruthy();
        expect(screen.getAllByText("Save")).toBeTruthy();
    })

    test("user can add custom questions", async() => {
        await render(<AddQuestion/>);
        await fireEvent.press(screen.getByRole("button", {name: "Add your own question"}));

        const user = userEvent.setup();
        const questionInput = screen.getByPlaceholderText("Enter your question");
        await user.type(questionInput, "Why am I restless at night?");

        expect(questionInput.props.value).toBe("Why am I restless at night?");
    })

    test("question added shows up under the 'Other' section", async() => {
        await render(<AddQuestion/>);
        await fireEvent.press(screen.getByRole("button", {name: "Add your own question"}));

        const user = userEvent.setup();
        const questionInput = screen.getByPlaceholderText("Enter your question");
        await user.type(questionInput, "Why am I restless at night?");

        await fireEvent.press(screen.getAllByRole("button", {name: "Save"})[0]);
        expect(screen.getByText("Why am I restless at night?")).toBeTruthy();
    })

    test("pressing save without adding any text throws an error", async() => {
        await render(<AddQuestion/>);

        const spyAlert = jest.spyOn(Alert, 'alert');
        await fireEvent.press(screen.getByRole("button", {name: "Add your own question"}));

        await fireEvent.press(screen.getAllByRole("button", {name: "Save"})[0]);
        expect(spyAlert).toHaveBeenCalledWith("Error", "Please enter a question");        
    })
})

//submission tests
describe('submission tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("successful submission to the database", async() => {
        await render(<AddQuestion/>);
        await fireEvent.press(screen.getByText('What can I do to better manage days when the pain is high?'));   
        await fireEvent.press(screen.getByRole("button", {name: "Save"}));  
        
        await waitFor(() => {
            expect(mockCreateQuestion).toHaveBeenCalledWith(
                'What can I do to better manage days when the pain is high?'
            );
        });     
    })

    test("throw an error if submission to database fails", async() => {
        (mockCreateQuestion as jest.Mock).mockRejectedValue(new Error("Could not submit"));
        await render(<AddQuestion/>);
        const spyAlert = jest.spyOn(Alert, 'alert');
        await fireEvent.press(screen.getByText('What can I do to better manage days when the pain is high?'));   
        await fireEvent.press(screen.getByRole("button", {name: "Save"}));  
        
        await waitFor(() => {
            expect(spyAlert).toHaveBeenCalledWith(
                'Error',
                'Failed to complete. Please try again.',
            );
        });     
    })
})

//navigation
describe("navigation tests", ()=> {

    beforeEach(() => {
        jest.clearAllMocks();
        (mockCreateQuestion as jest.Mock).mockResolvedValue(undefined);
    })

    test("pressing save after selecting a question should navigate to questions list", async() => {
        await render(<AddQuestion/>);
        await fireEvent.press(screen.getByText('What can I do to better manage days when the pain is high?'));   
        await fireEvent.press(screen.getByRole("button", {name: "Save"}));      
        await waitFor(() => {
            expect(mockCreateQuestion).toHaveBeenCalledWith('What can I do to better manage days when the pain is high?');
            expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(questions)/questions');
        })
    })

    test('user presses the back button', async() => {
        await render(<AddQuestion/>);
        fireEvent.press(screen.getByText("‹ Back"));
        expect(mockBack).toHaveBeenCalled();
    })
})

