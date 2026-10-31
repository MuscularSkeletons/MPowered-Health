import Questions from "@/app/(tabs)/(questions)/questions";
import { useQuestions } from "@/hooks/useQuestions";
import { render, screen, fireEvent, waitFor, userEvent, act } from "@testing-library/react-native";
import { useFocusEffect } from "expo-router";
import { Alert } from "react-native";

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
        await fireEvent.press(screen.getByRole('button', {name: 'Delete'}));
        expect(spyAlert).toHaveBeenCalledWith("Delete Question", "Are you sure you want to delete this question?", expect.arrayContaining(alertButtons));
    })

    test("when cancel is pressed, the question card is not deleted", async() => {
        await render(<Questions/>);
        const spyAlert = jest.spyOn(Alert, 'alert');

        await fireEvent.press(screen.getByRole('button', {name: 'Delete'}));
        
        //press the cancel button
        const buttons = spyAlert.mock.calls?.[0]?.[2];
        await act(async() => {
           await buttons?.[0]?.onPress?.();
        }) 

        expect(mockDeleteQuestions).not.toHaveBeenCalled();
    })

    test("when delete is pressed on the alert, the question card is deleted", async() => {
        await render(<Questions/>);
        const spyAlert = jest.spyOn(Alert, 'alert');

        await fireEvent.press(screen.getByRole('button', {name: 'Delete'}));
        
        //press the delete button
        const buttons = spyAlert.mock.calls?.[0]?.[2];
        await act(async() => {
            await buttons?.[1]?.onPress?.();
        }) 

        await waitFor(() => {
            expect(mockDeleteQuestions).toHaveBeenCalled(); 
        }) 

    })
})

describe("recording answers", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockQuestions = [mockQuestion];
    })
    
    test("when add answer is pressed, a pop up opens to add an answer to the question", async() => {
        await render(<Questions/>);
        //arrow next to add answer
        await fireEvent.press(screen.getByText("›"));
        expect(screen.getByText('Answer')).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter your answer")).toBeTruthy();
    })

    test("user can add an answer to the question", async() => {
        await render(<Questions/>);
        //arrow next to add answer
        await fireEvent.press(screen.getByText("›"));
        expect(screen.getByText('Answer')).toBeTruthy();

        const user = userEvent.setup();
        const answerInput = screen.getByPlaceholderText("Enter your answer");
        await user.type(answerInput, "Getting 8 hours of sleep");

        expect(answerInput.props.value).toBe("Getting 8 hours of sleep");
    })

    test("save an answer to the question", async() => {
        await render(<Questions/>);
        //arrow next to add answer
        await fireEvent.press(screen.getByText("›"));
        expect(screen.getByText('Answer')).toBeTruthy();

        const user = userEvent.setup();
        const answerInput = screen.getByPlaceholderText("Enter your answer");
        await user.type(answerInput, "Getting 8 hours of sleep");

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
        expect(screen.getByText('Answer')).toBeTruthy();

        await fireEvent.press(screen.getByText("Save"));
        expect(spyAlert).toHaveBeenCalledWith("Error", "Please enter an answer");
    })    
})

//edit asnwer tests
describe("editing answers", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("edit a saved answer to the question", async() => {
        await render(<Questions/>);
        //arrow next to add answer
        await fireEvent.press(screen.getByText("›"));
        expect(screen.getByText('Answer')).toBeTruthy();

        const user = userEvent.setup();
        const answerInput = screen.getByPlaceholderText("Enter your answer");
        await user.type(answerInput, "Getting 8 hours of sleep");

        await fireEvent.press(screen.getByText("Save"));
        await waitFor(() => {
            expect(mockUpdateAnswer).toHaveBeenCalledWith("1", "Getting 8 hours of sleep");
        });

        //editing answer
        await fireEvent.press(screen.getByText("›"));
        await fireEvent.changeText(answerInput, "Getting 10 hours of sleep");
        
        await fireEvent.press(screen.getByText("Save"));
        await waitFor(() => {
            expect(mockUpdateAnswer).toHaveBeenCalledWith("1", "Getting 8 hours of sleep");
        });       
    })     

})
//navigation
describe("navigation tests", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    })
    
    test("pressing + should navigate to add questions page", async() => {
        await render (<Questions/>);
        await fireEvent.press(screen.getByText("+"));
        expect(mockPush).toHaveBeenCalledWith("/(tabs)/(questions)/addquestion");        
    })
})