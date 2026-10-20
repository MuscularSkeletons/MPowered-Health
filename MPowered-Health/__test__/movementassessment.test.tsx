//import { MovementAssessment } from '../src/app/(tabs)/(assessment)/movementassessment';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AssessmentScreen from '@/components/assessment/assessmentScreen';
import { submitAssessmentAnswers } from '@/hooks/useAssessments';
import { movementQuestions } from '@/constants/assessmentQuestions/movementQuestions';

const mockUser = jest.fn(() => Promise.resolve('mocked user'));
const onBack = jest.fn();

jest.mock("@/context/authcontext", () => ({
    useAuth: () => ({
        user: mockUser,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
        isLoading: false,
    }),
}));

jest.mock('@/hooks/useAssessments', () => ({
    submitAssessmentAnswers: jest.fn(),
})) 

// rendering test
describe("movement assessment questions are rendered on screen", () => {

    beforeEach(async() => {
            await render (<AssessmentScreen categoryData={movementQuestions} onBack={onBack}/>);
    });
    
    afterEach(jest.clearAllMocks);
    
    test("question 1 (General Movement Impacts) is rendered on screen", () => {
        expect(screen.getByText('General Movement Impacts')).toBeTruthy();
        expect(screen.getByText('On average, how many hours per day were you able to stay active or mobile last week?')).toBeTruthy();
        // hours
        expect(screen.getByText('Less than 1 hour')).toBeTruthy();
        expect(screen.getByText('1 - 2 hours')).toBeTruthy();
        expect(screen.getByText('3 - 4 hours')).toBeTruthy();
        expect(screen.getByText('5 - 6 hours')).toBeTruthy();
        expect(screen.getByText('7+ hours')).toBeTruthy();

        expect(screen.getByText('Staying active could mean doing your typical activities, such as working, driving, doing household chores, or meeting with people.')).toBeTruthy();

        expect(screen.getByText('1/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 2 (General Movement Impacts) is rendered on screen", async() => {

        //navigate to question 2
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByText('General Movement Impacts')).toBeTruthy();
        expect(screen.getByText('Select ALL relevant statements:')).toBeTruthy();
        // options
        expect(screen.getByText('I walk more slowly than usual because of my pain')).toBeTruthy();
        expect(screen.getByText('I lie down to rest more often because of my pain')).toBeTruthy();
        expect(screen.getByText('I only stand up for short periods of time because of my pain')).toBeTruthy();
        expect(screen.getByText('I try not to bend or kneel down because of my pain')).toBeTruthy();
        expect(screen.getByText('I find it difficult to get out of a chair because of my pain')).toBeTruthy();
        expect(screen.getByText('I sit down most of the day because of my pain')).toBeTruthy();

        expect(screen.getByText('2/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    }); 

    test("question 3 (Walking Impacts) is rendered on screen", async() => {

        //navigate to question 3
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByText('Walking Impacts')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('Pain does not prevent me walking any distance')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from walking more than 1 kilometre')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from walking more than 500 metres')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from walking more than 100 metres')).toBeTruthy();
        expect(screen.getByText('I can only walk using a stick or crutches')).toBeTruthy();
        expect(screen.getByText('I am in bed most of the time and have to crawl to the toilet')).toBeTruthy();

        expect(screen.getByText('3/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 4 (Lifting Impacts) is rendered on screen", async() => {

        //navigate to question 4
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('Pain does not prevent me walking any distance'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByText('Lifting Impacts')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('I can lift heavy weights without extra pain')).toBeTruthy();
        expect(screen.getByText('I can lift heavy weights, but it causes extra pain')).toBeTruthy();
        expect(screen.getByText('I struggle to lift heavy weights off the floor, but I can lift them from a table')).toBeTruthy();
        expect(screen.getByText('I struggle to lift heavy weights off the floor, but I can lift medium weights from a table')).toBeTruthy();
        expect(screen.getByText('I can lift only very light weights')).toBeTruthy();
        expect(screen.getByText('I cannot lift or carry anything at all')).toBeTruthy();

        expect(screen.getByText('4/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 5 (Sitting Impacts) is rendered on screen", async() => {

        //navigate to question 5
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('Pain does not prevent me walking any distance'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I can lift heavy weights without extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByText('Sitting Impacts')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('I can sit in any chair as long as I like')).toBeTruthy();
        expect(screen.getByText('I can only sit in my favourite chair as long as I like')).toBeTruthy();
        expect(screen.getByText('Pain prevents me sitting more than 1 hour')).toBeTruthy();
        expect(screen.getByText('Pain prevents me sitting more than 30 minutes')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from sitting more than 10 minutes')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from sitting at all')).toBeTruthy();

        expect(screen.getByText('5/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 6 (Standing Impacts) is rendered on screen", async() => {

        //navigate to question 6
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('Pain does not prevent me walking any distance'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I can lift heavy weights without extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I can sit in any chair as long as I like'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByText('Standing Impacts')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('I can stand as long as I want without increased pain')).toBeTruthy();
        expect(screen.getByText('I can stand as long as I want, but it increases my pain')).toBeTruthy();
        expect(screen.getByText('Pain prevents me standing more than one hour')).toBeTruthy();
        expect(screen.getByText('Pain prevents me standing more than 30 minutes')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from standing more than 10 minutes')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from standing at all')).toBeTruthy();

        expect(screen.getByText('6/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 7 (Reflection) is rendered on screen", async() => {

        //navigate to question 7
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('Pain does not prevent me walking any distance'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I can lift heavy weights without extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I can sit in any chair as long as I like'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I can stand as long as I want without increased pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByText('Reflection on your movement')).toBeTruthy();
        expect(screen.getByText('Write any reflections of pain impacts on your mobility.')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('For instance, when pain occured, you lie down for the whole day.')).toBeTruthy();

        expect(screen.getByText('7/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

});

/*
// selection/input tests
describe("my movement assessment questions are selected/inputted correctly", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("question 1 answer can be entered", async() => {
        await render(<MovementAssessment/>);
        const hours = screen.getByPlaceholderText("0");
        const user = userEvent.setup();
        await user.type(hours, "2");

        expect(hours.props.value).toBe("2");
    });

    test("question 2 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<MovementAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    

    test("question 3 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<MovementAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });
    
    test("question 4 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<MovementAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 5 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<MovementAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 6 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<MovementAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 7 answer can be entered", async() => {
        await render(<MovementAssessment/>);
        const reflection = screen.getByPlaceholderText("For instance, when pain occured, you lie down for the whole day.");
        const user = userEvent.setup();
        await user.type(reflection, "I was able to walk for 2 hours without pain.");

        expect(reflection.props.value).toBe("I was able to walk for 2 hours without pain.");
    });

});

// input validation tests
describe("input validation for question 1 & 7", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // question 1 is mandatory
    test("no text is entered for question 1", async() => {
        jest.spyOn(Alert, "alert");
        await render(<MovementAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    // question 1 must be a number
    test("non-numeric text is entered for question 1", async() => {
        jest.spyOn(Alert, "alert");
        await render(<MovementAssessment/>);
        const hours = screen.getByPlaceholderText("0");
        const user = userEvent.setup();
        await user.type(hours, "abc");
        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please enter a valid number");
    });

    // question 7 is optional
    test("no text is entered for question 7", async() => {
        jest.spyOn(Alert, "alert");
        await render(<MovementAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).not.toHaveBeenCalled(); // optional question
    });
});*/

// navigation tests
describe("navigation", () => {

    beforeEach(async() => {
            await render (<AssessmentScreen categoryData={movementQuestions} onBack={onBack}/>);
    });
    
    afterEach(jest.clearAllMocks);

    test('navigate through all the questions to the summary screen', async() => {

        //question 1
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 2
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 3
        await fireEvent.press(screen.getByText('Pain does not prevent me walking any distance'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByText('I can lift heavy weights without extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 5
        await fireEvent.press(screen.getByText('I can sit in any chair as long as I like'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 6
        await fireEvent.press(screen.getByText('I can stand as long as I want without increased pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 7
        const user = userEvent.setup();
        const reflectionInput = screen.getByPlaceholderText('For instance, when pain occured, you lie down for the whole day.');
        await user.type(reflectionInput, 'I had no trouble walking the stairs today!');
        await fireEvent.press(screen.getByRole('button', {name: 'Review'}));

        //summary screen
        expect(screen.getByText('My Movement Summary')).toBeTruthy();
    });

    
    test('pressing back on a question (except question 1) should navigate to the previous question', async() => {
        //navigate to question 2
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        await fireEvent.press(screen.getByText('‹ Back'));
        expect(screen.getByText('1/7')).toBeTruthy(); 
    })

    test('pressing back on a question 1 should navigate to the homescreen', async() => {
        await fireEvent.press(screen.getByText('‹ Back'));
        expect(onBack).toHaveBeenCalled();
        //homescreen
    })

    test('pressing close on summary screen should navigate to homescreen', async() => {
        //question 1
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 2
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 3
        await fireEvent.press(screen.getByText('Pain does not prevent me walking any distance'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByText('I can lift heavy weights without extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 5
        await fireEvent.press(screen.getByText('I can sit in any chair as long as I like'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 6
        await fireEvent.press(screen.getByText('I can stand as long as I want without increased pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 7
        const user = userEvent.setup();
        const reflectionInput = screen.getByPlaceholderText('For instance, when pain occured, you lie down for the whole day.');
        await user.type(reflectionInput, 'I had no trouble walking the stairs today!');
        await fireEvent.press(screen.getByRole('button', {name: 'Review'}));

        //summary screen
        expect(screen.getByText('My Movement Summary')).toBeTruthy();

        await fireEvent.press(screen.getByText('Close'));
        expect(onBack).toHaveBeenCalled();
    })

    test("pressing edit on summary screen should navigate to question 1", async() => {
        //question 1
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 2
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 3
        await fireEvent.press(screen.getByText('Pain does not prevent me walking any distance'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByText('I can lift heavy weights without extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 5
        await fireEvent.press(screen.getByText('I can sit in any chair as long as I like'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 6
        await fireEvent.press(screen.getByText('I can stand as long as I want without increased pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 7
        const user = userEvent.setup();
        const reflectionInput = screen.getByPlaceholderText('For instance, when pain occured, you lie down for the whole day.');
        await user.type(reflectionInput, 'I had no trouble walking the stairs today!');
        await fireEvent.press(screen.getByRole('button', {name: 'Review'}));

        //summary screen
        expect(screen.getByText('My Movement Summary')).toBeTruthy();

        await fireEvent.press(screen.getByText('Edit'));
        expect(screen.getByText('1/7')).toBeTruthy();
    })

});