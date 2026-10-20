//import { ManagementAssessment } from '../src/app/(tabs)/(assessment)/managementassessment';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
//import { managementQuestions } from "@/constants/assessment/questions";
import { Alert } from 'react-native';
import AssessmentScreen from '@/components/assessment/assessmentScreen';
import { managementQuestions } from '@/constants/assessmentQuestions/managementQuestions';
import { submitAssessmentAnswers } from '@/hooks/useAssessments';


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
describe("my management assessment questions are rendered on screen", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);
    
    test("question 1 (Medication) is rendered on screen", () => {
        expect(screen.getByText('Medication')).toBeTruthy();
        expect(screen.getByText("My Management")).toBeTruthy();
        expect(screen.getByText('Over the past week, select medications that you consumed to manage your pain.')).toBeTruthy();
        expect(screen.getByText('Not taking medications? You can continue without selecting an option. This list is generated from your medication records.')).toBeTruthy();
        //expect(screen.getByText('Generated based on your medication scripts')).toBeTruthy();
        // options
        // TODO: when see how assessment is implemented 
        // options rendered on screen are hard coded values right now
        expect(screen.getByText('Perindopril arginine 5 mg — Once daily')).toBeTruthy();
        expect(screen.getByText('Candesartan 16 mg — Once daily')).toBeTruthy();
        expect(screen.getByText('Amlodipine 5 mg — Once daily')).toBeTruthy();
        expect(screen.getByText('Vitamin D3 1000 IU — Once daily')).toBeTruthy();
        expect(screen.getByText('Raloxifene 60 mg — Once daily')).toBeTruthy();
        
        expect(screen.getByText('1/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 2 (Medication) is rendered on screen", async() => {
        //navigate to question 2
        await fireEvent.press(screen.getByText('Perindopril arginine 5 mg — Once daily'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByText('Medication')).toBeTruthy();
        expect(screen.getByText('Over the past week, did you take any over-the-counter (OTC) medication?')).toBeTruthy();
        expect(screen.getByText('Not taking OTC medication? You can continue without entering a medication.')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('Input name of over the counter medication')).toBeTruthy();

        expect(screen.getByText('2/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 3 (Exercise) is rendered on screen", async() => {

        //navigate to question 3
        await fireEvent.press(screen.getByText('Perindopril arginine 5 mg — Once daily'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));

        expect(screen.getByText('Exercise')).toBeTruthy();
        expect(screen.getByText('In the past 7 days, did you perform any exercises to manage your musculoskeletal pain or improve your movement?')).toBeTruthy();
        expect(screen.getByText('Examples include walking, stretching, strengthening, yoga, resistance-band work, or balance exercises.')).toBeTruthy();
        // options
        expect(screen.getByText('0 days')).toBeTruthy();
        expect(screen.getByText('1-2 days')).toBeTruthy();
        expect(screen.getByText('3-4 days')).toBeTruthy();
        expect(screen.getByText('5-6 days')).toBeTruthy();
        expect(screen.getByText('7 days')).toBeTruthy();

        expect(screen.getByText('3/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 4 (Emotion) is rendered on screen", async() => {

        //navigate to question 4
        await fireEvent.press(screen.getByText('Perindopril arginine 5 mg — Once daily'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));
        await fireEvent.press(screen.getByText("0 days"));
        await fireEvent.press(screen.getByRole("button", {name : "Record"}));

        expect(screen.getByText('Emotion')).toBeTruthy();
        expect(screen.getByText('Over the past week, did you perform any strategies to manage your stress level or emotion?')).toBeTruthy();
        expect(screen.getByText('Examples include meditation, journaling, or meeting with people.')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('Examples: meditation, journaling, meeting people')).toBeTruthy();

        expect(screen.getByText('4/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
    });

});

/*
// selection/input tests
describe("my management assessment questions are selected/inputted correctly", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);

    test("can select multiple options for question 1", async() => {

        await fireEvent.press(screen.getByText('Perindopril arginine 5 mg — Once daily'));
        await fireEvent.press(screen.getByText('Candesartan 16 mg — Once daily'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //check props values
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("user can enter a text response for question 2", async() => {

        //navigate to question 2
        await fireEvent.press(screen.getByText('Perindopril arginine 5 mg — Once daily'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        const otcMedication = screen.getByPlaceholderText("Input name of over the counter medication");
        const user = userEvent.setup();
        await user.type(otcMedication, "Ibuprofen");

        expect(otcMedication.props.value).toBe("Ibuprofen");
    });

    test("question 3 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");


        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 4 answer can be entered", async() => {

        const emotionStrategies = screen.getByPlaceholderText("Examples: meditation, journaling, meeting people");
        const user = userEvent.setup();
        await user.type(emotionStrategies, "Meditation");

        expect(emotionStrategies.props.value).toBe("Meditation");
    });

});

// input validation tests
describe("input validation for question 2 & 4", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("no text is entered", async() => {
        jest.spyOn(Alert, "alert");
        await render(<ManagementAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect("").toBeTruthy(); // optional question
    });
});*/

/*
describe("summary screen tests", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);

    test("objects are rendered on screen correctly", async() => {
        //test dummy data here
        expect(screen.getByText("My Management Summary")).toBeTruthy();
        expect(screen.getByText("This helps guide your treatment and support your recovery.")).toBeTruthy();
        expect(screen.getByText("My Management")).toBeTruthy();
        expect(screen.getByText("Medication")).toBeTruthy();
        expect(screen.getByText("Exercise")).toBeTruthy();
        expect(screen.getByText("Emotion")).toBeTruthy();
        expect(screen.getByText("Your answers have been saved")).toBeTruthy();
        expect(screen.getByText("Edit")).toBeTruthy();
        expect(screen.getByText("Close")).toBeTruthy();
    })

})*/

// navigation tests
describe("navigation", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);

    test("navigate through all the questions to the summary screen", async() => {
        //navigate through questions 1 - 4

        //question 1
        expect(screen.getByText("1/4")).toBeTruthy();
        await fireEvent.press(screen.getByText('Perindopril arginine 5 mg — Once daily'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 2
        expect(screen.getByText("2/4")).toBeTruthy();
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));

        //question 3
        expect(screen.getByText("3/4")).toBeTruthy();
        await fireEvent.press(screen.getByText("0 days"));
        await fireEvent.press(screen.getByRole("button", {name : "Record"}));

        //question 4
        expect(screen.getByText("4/4")).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        //summary screen
        expect(screen.getByText("My Management Summary")).toBeTruthy();
    })

    test('pressing back on a question (except question 1) should navigate to the previous question', async() => {
        // navigate to question 2 
        await fireEvent.press(screen.getByText('Perindopril arginine 5 mg — Once daily'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'})); 

        await fireEvent.press(screen.getByText('‹ Back'));
        expect(screen.getByText('1/4')).toBeTruthy();
    })

    test('pressing back on a question 1 should navigate to the homescreen', async() => {
        await fireEvent.press(screen.getByText('‹ Back'));
        expect(onBack).toHaveBeenCalled();
        //homescreen
    })

    test('pressing close on summary screen should navigate to homescreen', async() => {
        //question 1
        expect(screen.getByText("1/4")).toBeTruthy();
        await fireEvent.press(screen.getByText('Perindopril arginine 5 mg — Once daily'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 2
        expect(screen.getByText("2/4")).toBeTruthy();
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));

        //question 3
        expect(screen.getByText("3/4")).toBeTruthy();
        await fireEvent.press(screen.getByText("0 days"));
        await fireEvent.press(screen.getByRole("button", {name : "Record"}));

        //question 4
        expect(screen.getByText("4/4")).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        //summary screen
        expect(screen.getByText("My Management Summary")).toBeTruthy();

        await fireEvent.press(screen.getByText('Close'));
        expect(onBack).toHaveBeenCalled();        
    })

    test("pressing edit on summary screen should navigate to question 1", async() => {
        //question 1
        expect(screen.getByText("1/4")).toBeTruthy();
        await fireEvent.press(screen.getByText('Perindopril arginine 5 mg — Once daily'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 2
        expect(screen.getByText("2/4")).toBeTruthy();
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));

        //question 3
        expect(screen.getByText("3/4")).toBeTruthy();
        await fireEvent.press(screen.getByText("0 days"));
        await fireEvent.press(screen.getByRole("button", {name : "Record"}));

        //question 4
        expect(screen.getByText("4/4")).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        //summary screen
        expect(screen.getByText("My Management Summary")).toBeTruthy();

        await fireEvent.press(screen.getByText('Edit'));
        expect(screen.getByText('1/4')).toBeTruthy();
    })
});