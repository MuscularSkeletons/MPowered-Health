import AssessmentScreen from '@/components/assessment/assessmentScreen';
import { submitAssessmentAnswers } from '@/hooks/useAssessments';
import { movementQuestions } from '@/constants/assessmentQuestions/movementQuestions';
import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockUser = jest.fn(() => Promise.resolve('mocked user'));
const onBack = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => 
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'))

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

jest.mock('@/context/prescriptionsContext', () => ({
    usePrescriptions: jest.fn (() => ({
        list: [],
    })),
}))

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

        expect(screen.getByText('Write any reflections of pain impacts on your mobility.')).toBeTruthy();
        expect(screen.getByText('Reflection on your movement')).toBeTruthy();
        expect(screen.getByText('For instance, when pain occured, you lie down for the whole day.')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('Write your reflection')).toBeTruthy();

        expect(screen.getByText('7/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

});

// selection + record button tests (combined as similar tests and to avoid duplicates)
describe("my movement assessment questions are selected/inputted correctly", () => {
    
    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={movementQuestions} onBack={onBack}/>);
    });
        
    afterEach(jest.clearAllMocks);

    test("record button is disabled when no option is selected for question 1", async() => {
        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();
    });

    test("record button is enabled when an option is selected for question 1", async() => {
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    });

    test("record button is disabled when no option is selected for question 2", async() => {
        //navigate to question 2
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();
    });

    test("record button is enabled when an option is selected for question 2", async() => {
        //navigate to question 2
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    });

    test("record button is enabled when multiple options are selected for question 2", async() => {
        //navigate to question 2
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByText('I try not to bend or kneel down because of my pain'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    })
    
    test("record button is disabled when no option is selected for question 3", async() => {
        //navigate to question 3
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();
    });

    test("record button is enabled when an option is selected for question 3", async() => {
        //navigate to question 3
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        await fireEvent.press(screen.getByText('Pain does not prevent me walking any distance'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    });

        test("record button is disabled when no option is selected for question 4", async() => {
        //navigate to question 4
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('Pain does not prevent me walking any distance'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();
    });

    test("record button is enabled when an option is selected for question 4", async() => {
        //navigate to question 4
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('Pain does not prevent me walking any distance'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        await fireEvent.press(screen.getByText('I can lift heavy weights without extra pain'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    });
    
    test("record button is disabled when no option is selected for question 5", async() => {
        //navigate to question 5
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('Pain does not prevent me walking any distance'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I can lift heavy weights without extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();
    });

    test("record button is enabled when an option is selected for question 5", async() => {
        //navigate to question 5
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('Pain does not prevent me walking any distance'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I can lift heavy weights without extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        await fireEvent.press(screen.getByText('I can sit in any chair as long as I like'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    });
    
    test("record button is disabled when no option is selected for question 6", async() => {
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

        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();
    });

    test("record button is enabled when an option is selected for question 6", async() => {
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

        await fireEvent.press(screen.getByText('I can stand as long as I want without increased pain'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    });

    test("record button is enabled when no text is entered for question 7", async() => {
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
    
        expect(screen.getByRole("button", {name: "Review"})).toBeEnabled();      
    })

    test("record button is enabled when text is entered for question 7", async() => {
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
        
        const reflectionInput = screen.getByPlaceholderText("Write your reflection");
        const user = userEvent.setup();
        await user.type(reflectionInput, "I was able to walk for 2 hours without pain.");
    
        expect(reflectionInput.props.value).toBe("I was able to walk for 2 hours without pain.");
        expect(screen.getByRole("button", {name: "Review"})).toBeEnabled();      
    })
});

// input validation tests testing the 500 character limit 
describe("input validation for question 7", () => {

    afterEach(jest.clearAllMocks);

    test("text entered is within the character limit", async() => {
        await render (<AssessmentScreen categoryData={movementQuestions} onBack={onBack}/>);
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
        
        const reflectionInput = screen.getByPlaceholderText("Write your reflection");
        await fireEvent.changeText(reflectionInput, "Pain Pain Pain Pain Pain Pain Pain Pain Pain Pain Pain Pain Pain Pain Pain Pain Pain Pain Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibu ");
        const updatedInput = screen.getByPlaceholderText('Write your reflection');
        expect(updatedInput.props.value).toHaveLength(500);
    });
});

describe("summary screen tests", () => {
    
    afterEach(jest.clearAllMocks);
    
    test("objects are rendered on screen correctly", async() => {
        await render (<AssessmentScreen categoryData={movementQuestions} onBack={onBack} existingAnswers={{
            active_hour: '1 - 2 hours',
            general_impacts: 'I walk more slowly than usual because of my pain',
            walking_impact: 'Pain prevents me from walking more than 100 metres',
            lifting_impact:'I can lift very light weights',
            sitting_impact: 'Pain prevents me sitting more than 1 hour',
            standing_impact:'Pain prevents me from standing for more than 1 hour',
        }}/>);
        
        //navigate to summary screen
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

        //summary screen
        expect(screen.getByText("My Movement Summary")).toBeTruthy();
        expect(screen.getByText("This helps guide your treatment and support your recovery.")).toBeTruthy();
        expect(screen.getByText("My Movement")).toBeTruthy();

        //headings
        expect(screen.getByText("General Movement Impacts")).toBeTruthy();
        expect(screen.getByText("Walking Impacts")).toBeTruthy();
        expect(screen.getByText("Lifting Impacts")).toBeTruthy();
        expect(screen.getByText("Sitting Impacts")).toBeTruthy();
        expect(screen.getByText("Standing Impacts")).toBeTruthy();
        expect(screen.getByText("Reflection on your movement")).toBeTruthy();

        //questions
        expect(screen.getByText('On average, how many hours per day were you able to stay active or mobile last week?')).toBeTruthy();
        expect(screen.getByText('Select ALL relevant statements:')).toBeTruthy();
        expect(screen.getAllByText('Select the MOST relevant statement:')).toBeTruthy();
        expect(screen.getByText('Write any reflections of pain impacts on your mobility')).toBeTruthy();
       
        //user's answers
        expect(screen.getByText('1 - 2 hours')).toBeTruthy();
        expect(screen.getByText('I walk more slowly than usual because of my pain')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from walking more than 100 metres')).toBeTruthy();
        expect(screen.getByText('I can lift very light weights')).toBeTruthy();
        expect(screen.getByText('Pain prevents me sitting more than 1 hour')).toBeTruthy();
        expect(screen.getByText('Pain prevents me standing more than one hour')).toBeTruthy();
        expect(screen.getByText("No response")).toBeTruthy();
        
        //message
        expect(screen.getByText("Your answers have been saved")).toBeTruthy();

        //buttons
        expect(screen.getByText("Edit")).toBeTruthy();
        expect(screen.getByText("Close")).toBeTruthy();
    })

    //tests for displaying the appropriate message according to the score
    test("score less than 5", async() => {
        await render (<AssessmentScreen categoryData={movementQuestions} onBack={onBack} existingAnswers={{
            active_hour: '1 - 2 hours',
            general_impacts: 'I walk more slowly than usual because of my pain',
            walking_impact: 'Pain does not prevent me walking any distance',
            lifting_impact:'I can lift heavy weights without extra pain',
            sitting_impact: 'I can sit in any chair as long as I like',
            standing_impact:'I can stand as long as I want without increased pain',
        }}/>);

        //navigate to summary screen
        //question 1
        await fireEvent.press(screen.getByText('1 - 2 hours'));
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

        //summary screen
        expect(screen.getByText("My Movement Summary")).toBeTruthy();
        expect(screen.getByText('Your answers indicate that pain does not really impact your movement.')).toBeTruthy();
    })

    test("score less than 10 and more than 5", async() => {
        await render (<AssessmentScreen categoryData={movementQuestions} onBack={onBack} existingAnswers={{
            active_hour: '1 - 2 hours',
            general_impacts: 'I walk more slowly than usual because of my pain',
            walking_impact: 'Pain prevents me from walking more than 1 kilometre',
            lifting_impact:'I can lift heavy weights, but it causes extra pain',
            sitting_impact: 'I can only sit in my favourite chair as long as I like',
            standing_impact:'I can stand as long as I want, but it increases my pain',
        }}/>);
        
        //navigate to summary screen
        //question 1
        await fireEvent.press(screen.getByText('1 - 2 hours'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 2
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 3
        await fireEvent.press(screen.getByText('Pain prevents me from walking more than 1 kilometre'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 4
        await fireEvent.press(screen.getByText('I can lift heavy weights, but it causes extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 5
        await fireEvent.press(screen.getByText('I can only sit in my favourite chair as long as I like'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 6
        await fireEvent.press(screen.getByText('I can stand as long as I want, but it increases my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));       

        //summary screen
        expect(screen.getByText("My Movement Summary")).toBeTruthy();
        expect(screen.getByText('Your answers indicate that pain mildly impacts your movement.')).toBeTruthy();
    })

    test("score less than 15 and more than 10", async() => {
        await render (<AssessmentScreen categoryData={movementQuestions} onBack={onBack} existingAnswers={{
            active_hour: '1 - 2 hours',
            general_impacts: 'I walk more slowly than usual because of my pain',
            walking_impact: 'Pain prevents me from walking more than 500 metres',
            lifting_impact:'I struggle to lift heavy weights off the floor, but I can lift them from a table',
            sitting_impact: 'Pain prevents me sitting more than 1 hour',
            standing_impact:'Pain prevents me standing more than one hour',
        }}/>);
        
        //navigate to summary screen
        //question 1
        await fireEvent.press(screen.getByText('1 - 2 hours'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 2
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 3
        await fireEvent.press(screen.getByText('Pain prevents me from walking more than 500 metres'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 4
        await fireEvent.press(screen.getByText('I struggle to lift heavy weights off the floor, but I can lift them from a tabl'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 5
        await fireEvent.press(screen.getByText('Pain prevents me sitting more than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 6
        await fireEvent.press(screen.getByText('Pain prevents me standing more than one hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));       

        //summary screen
        expect(screen.getByText("My Movement Summary")).toBeTruthy();
        expect(screen.getByText('Your answers indicate that pain moderately impacts your movement.')).toBeTruthy();
    })

    test("score more than 15", async() => {
        await render (<AssessmentScreen categoryData={movementQuestions} onBack={onBack} existingAnswers={{
            active_hour: '1 - 2 hours',
            general_impacts: 'I walk more slowly than usual because of my pain',
            walking_impact: 'I am in bed most of the time and have to crawl to the toilet',
            lifting_impact:'I cannot lift or carry anything at all',
            sitting_impact: 'Pain prevents me from sitting at all',
            standing_impact:'Pain prevents me from standing at all',
        }}/>);
        
        //navigate to summary screen
        //question 1
        await fireEvent.press(screen.getByText('Less than 1 hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 2
        await fireEvent.press(screen.getByText('I walk more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 3
        await fireEvent.press(screen.getByText('I am in bed most of the time and have to crawl to the toilet'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 4
        await fireEvent.press(screen.getByText('I cannot lift or carry anything at all'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 5
        await fireEvent.press(screen.getByText('Pain prevents me from sitting at all'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 6
        await fireEvent.press(screen.getByText('Pain prevents me from standing at all'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));       

        //summary screen
        expect(screen.getByText("My Movement Summary")).toBeTruthy();
        expect(screen.getByText('Your answers indicate that pain significantly impacts your movement.')).toBeTruthy(); 
    })
})

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

//submission tests
describe("submitting users answers to database", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={movementQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);

    test("successful submission of the user's answers", async() => {
    
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

        await waitFor(() => {
            expect(submitAssessmentAnswers).toHaveBeenCalledWith({
                categoryTitle: "My Movement",
                answers: {
                    active_hour: 'Less than 1 hour',
                    general_impacts: 'I walk more slowly than usual because of my pain',
                    walking_impact: 'Pain does not prevent me walking any distance',
                    lifting_impact:'I can lift heavy weights without extra pain',
                    sitting_impact: 'I can sit in any chair as long as I like',
                    standing_impact:'I can stand as long as I want without increased pain',
                    movement_reflection: 'I had no trouble walking the stairs today!',
                }
            })
        })

        expect(screen.getByText("My Movement Summary")).toBeTruthy();
    })

    test("throw an error if submission to the database fails", async() => {
        (submitAssessmentAnswers as jest.Mock).mockRejectedValue(
            new Error('Network error')
        );
        const spyAlert = jest.spyOn(Alert, 'alert');

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

        await waitFor(() => {
            expect(spyAlert).toHaveBeenCalledWith('Could not save answers','Network error');
        });

        expect(screen.queryByText('My Movement Summary')).toBeNull();
    }) 
})