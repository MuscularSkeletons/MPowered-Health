import Questions from "@/app/(tabs)/(questions)/questions";
import { render, screen, fireEvent, waitFor, userEvent, act } from "@testing-library/react-native";
import { Alert } from "react-native";

//mocks
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

//mocking auth context
jest.mock('@/context/authcontext', () => ({
    useAuth: () => ({
        user: jest.fn(),
    }),
}));

//mocking questions hook
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

//rendering tests for questions main screen
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

//rendering tests for question cards
describe("question cards", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockQuestions = [mockQuestion];
    })

    test("when a question is added, it appears as a question card", async() => {
        await render (<Questions/>);

        //press the + symbol
        await fireEvent.press(screen.getByText("+"));
        expect(screen.getByText("What options are available to improve my quality of life?")).toBeTruthy();
        expect(screen.getByText("No answer submitted yet")).toBeTruthy();
        expect(screen.getByText("ADD ANSWER")).toBeTruthy();
    })
})

//deleting a question tests
describe("deleting questions", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockQuestions = [mockQuestion];
    })

    test("when delete icon is pressed, a delete alert appears", async() => {
        await render(<Questions/>);
        const spyAlert = jest.spyOn(Alert, 'alert');
        const alertButtons = [{
            text: 'Cancel',
            style: 'cancel',
        },
        {
            text: 'Delete',
            onPress: expect.anything(),
            style: 'destructive',
        }]

        //press delete button
        await fireEvent.press(screen.getByRole('button', {name: 'Delete'}));

        //alert pop up
        expect(spyAlert).toHaveBeenCalledWith("Delete Question", "Are you sure you want to delete this question?", expect.arrayContaining(alertButtons));
    })

    test("when cancel is pressed, the question card is not deleted", async() => {
        await render(<Questions/>);
        const spyAlert = jest.spyOn(Alert, 'alert');

        //press delete button
        await fireEvent.press(screen.getByRole('button', {name: 'Delete'}));
        
        //press the cancel button on alert pop up
        const buttons = spyAlert.mock.calls?.[0]?.[2];
        await act(async() => {
           await buttons?.[0]?.onPress?.();
        }) 

        //question should not be deleted
        expect(mockDeleteQuestions).not.toHaveBeenCalled();
    })

    test("when delete is pressed on the alert, the question card is deleted", async() => {
        await render(<Questions/>);
        const spyAlert = jest.spyOn(Alert, 'alert');

        //press delete button
        await fireEvent.press(screen.getByRole('button', {name: 'Delete'}));
        
        //press the delete button on alert pop up
        const buttons = spyAlert.mock.calls?.[0]?.[2];
        await act(async() => {
            await buttons?.[1]?.onPress?.();
        }) 

        //question should be deleted
        await waitFor(() => {
            expect(mockDeleteQuestions).toHaveBeenCalled(); 
        })
    })
})

//adding an answer for a question tests
describe("recording answers", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockQuestions = [mockQuestion];
    })
    
    test("when add answer is pressed, a pop up opens to add an answer to the question", async() => {
        await render(<Questions/>);

        //arrow next to add answer
        await fireEvent.press(screen.getByText("›"));

        //pop up
        expect(screen.getByText('Answer')).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter your answer")).toBeTruthy();
    })

    test("user can add an answer to the question", async() => {
        await render(<Questions/>);

        //arrow next to add answer
        await fireEvent.press(screen.getByText("›"));

        //pop up
        expect(screen.getByText('Answer')).toBeTruthy();

        //enter an answer
        const user = userEvent.setup();
        const answerInput = screen.getByPlaceholderText("Enter your answer");
        await user.type(answerInput, "Getting 8 hours of sleep");

        //checking the value entered
        expect(answerInput.props.value).toBe("Getting 8 hours of sleep");
    })

    test("save an answer to the question", async() => {
        await render(<Questions/>);
        //arrow next to add answer
        await fireEvent.press(screen.getByText("›"));

        //pop up
        expect(screen.getByText('Answer')).toBeTruthy();

        //enter an answer
        const user = userEvent.setup();
        const answerInput = screen.getByPlaceholderText("Enter your answer");
        await user.type(answerInput, "Getting 8 hours of sleep");

        //press the save button
        await fireEvent.press(screen.getByText("Save"));
        await waitFor(() => {
            expect(mockUpdateAnswer).toHaveBeenCalledWith("1", "Getting 8 hours of sleep");
        });
    }) 
    
    test("empty answer to the question throws an error", async() => {
        await render(<Questions/>);
        const spyAlert = jest.spyOn(Alert, 'alert');

        //arrow next to add answer
        await fireEvent.press(screen.getByText("›"));

        //pop up
        expect(screen.getByText('Answer')).toBeTruthy();

        //press the save button
        await fireEvent.press(screen.getByText("Save"));

        //alert pop up
        expect(spyAlert).toHaveBeenCalledWith("Error", "Please enter an answer");
    })    
})

//editing saved answers tests
describe("editing answers", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockQuestions = [mockQuestion];
    })

    test("edit a saved answer to the question", async() => {
        await render(<Questions/>);

        //arrow next to add answer
        await fireEvent.press(screen.getByText("›"));

        //pop up
        expect(screen.getByText('Answer')).toBeTruthy();

        //enter an answer
        const user = userEvent.setup();
        const answerInput = screen.getByPlaceholderText("Enter your answer");
        await user.type(answerInput, "Getting 8 hours of sleep");

        //press the save button to save the first answer
        await fireEvent.press(screen.getByText("Save"));
        await waitFor(() => {
            expect(mockUpdateAnswer).toHaveBeenCalledWith("1", "Getting 8 hours of sleep");
        });

        //reset the mock
        mockUpdateAnswer.mockReset();

        //arrow next to add answer
        await fireEvent.press(screen.getByText("›"));

        //enter the changed answer
        await user.clear(screen.getByTestId("answer-input"));
        await user.type(screen.getByTestId("answer-input"), "Getting 10 hours of sleep");
        
        //press save to save the edit
        await fireEvent.press(screen.getByText("Save"));
        await waitFor(() => {
            expect(mockUpdateAnswer).toHaveBeenCalledWith("1", "Getting 10 hours of sleep");
        });       
    })     
})

//navigation tests
describe("navigation tests", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    })
    
    test("pressing + should navigate to add questions page", async() => {
        await render (<Questions/>);
        
        //press the + button
        await fireEvent.press(screen.getByText("+"));
        expect(mockPush).toHaveBeenCalledWith("/(tabs)/(questions)/addquestion");        
    })
})