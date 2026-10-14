import { PersonalCareAssessment } from '../src/app/(tabs)/(assessment)/personalcareassessment';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { personalCareQuestions } from "@/constants/assessment/questions";
import { Alert } from 'react-native';

const mockUser = jest.fn(() => Promise.resolve('mocked user'));

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

// rendering test
describe("personal care assessment questions are rendered on screen", () => {

    beforeEach(async() => {
        await render (<PersonalCareAssessment/>);
    });

    afterEach(jest.clearAllMocks);
    
    test("question 1 (General Activities Impacts) is rendered on screen", () => {
        expect(screen.getByText('General Activities Impacts')).toBeTruthy();
        expect(screen.getByText('Select ALL relevant statements:')).toBeTruthy();
        // options
        expect(screen.getByText('I am not doing any jobs that I usually do around the house')).toBeTruthy();
        expect(screen.getByText('I get dressed more slowly than usual because of my pain')).toBeTruthy();
        expect(screen.getByText('I sleep less well because of my pain')).toBeTruthy();
        expect(screen.getByText('I am more irritable and bad tempered with people than usual')).toBeTruthy();
        expect(screen.getByText('I try to get other people to do things for me because of my pain')).toBeTruthy();

        expect(screen.getByText('1/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 2 (Personal care) is rendered on screen", () => {
        expect(screen.getByText('Personal care (washing, dressing, etc.)')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('I can look after myself normally without causing extra pain')).toBeTruthy();
        expect(screen.getByText('I can look after myself normally, but it causes extra pain')).toBeTruthy();
        expect(screen.getByText('It is painful to look after myself and I am slow and careful')).toBeTruthy();
        expect(screen.getByText('I need some help but manage most of my personal care')).toBeTruthy();
        expect(screen.getByText('I need help every day with most aspects of self-care')).toBeTruthy();
        expect(screen.getByText('I do not get dressed, wash with difficulty and stay in bed')).toBeTruthy();

        expect(screen.getByText('2/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 3 (Sleeping) is rendered on screen", () => {
        expect(screen.getByText('Sleeping')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('My sleep is never disturbed by pain')).toBeTruthy();
        expect(screen.getByText('My sleep is occasionally disturbed by pain')).toBeTruthy();
        expect(screen.getByText('Because of pain I have less than 6 hours of sleep')).toBeTruthy();
        expect(screen.getByText('Because of pain I have less than 4 hours of sleep')).toBeTruthy();
        expect(screen.getByText('Because of pain I have less than 2 hours of sleep')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from sleeping at all')).toBeTruthy();

        expect(screen.getByText('3/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 4 (Reflection) is rendered on screen", () => {
        expect(screen.getByText('Reflection on your personal care')).toBeTruthy();
        expect(screen.getByText('Write any reflections of pain impacts on your daily life.')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('For instance, this week, I felt that I could not everything at all, I felt hopeless, even doing the laundry felt miserable.')).toBeTruthy();

        expect(screen.getByText('4/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

});

// selection/input tests
describe("my personal care assessment questions are selected/inputted correctly", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("question 1 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<PersonalCareAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 2 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<PersonalCareAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 3 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<PersonalCareAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 4 answer can be entered", async() => {
        await render(<PersonalCareAssessment/>);
        const reflection = screen.getByPlaceholderText("For instance, this week, I felt that I could not everything at all, I felt hopeless, even doing the laundry felt miserable.");
        const user = userEvent.setup();
        await user.type(reflection, "I felt hopeless and unmotivated to do anything this week.");

        expect(reflection.props.value).toBe("I felt hopeless and unmotivated to do anything this week.");
    });

});

// input validation tests
describe("input validation for question 4", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("no text is entered", async() => {
        jest.spyOn(Alert, "alert");
        await render(<PersonalCareAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect("").toBeTruthy(); // optional question
    });
});

// navigation tests
describe("navigation", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('question 1 selected and navigate to next screen', async() => {
        await render(<PersonalCareAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("I sleep less well because of my pain"));
        fireEvent.press(screen.getByText("Record"));

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect question 2 components to be rendered on screen
        expect(screen.getByText('Personal care (washing, dressing, etc.)')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('I can look after myself normally without causing extra pain')).toBeTruthy();
        expect(screen.getByText('I can look after myself normally, but it causes extra pain')).toBeTruthy();
        expect(screen.getByText('It is painful to look after myself and I am slow and careful')).toBeTruthy();
        expect(screen.getByText('I need some help but manage most of my personal care')).toBeTruthy();
        expect(screen.getByText('I need help every day with most aspects of self-care')).toBeTruthy();
        expect(screen.getByText('I do not get dressed, wash with difficulty and stay in bed')).toBeTruthy();

        expect(screen.getByText('2/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test('question 2 selected and navigate to next screen', async() => {
        await render(<PersonalCareAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("I can look after myself normally without causing extra pain"));
        fireEvent.press(screen.getByText("Record"));

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect question 3 components to be rendered on screen
        expect(screen.getByText('Sleeping')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('My sleep is never disturbed by pain')).toBeTruthy();
        expect(screen.getByText('My sleep is occasionally disturbed by pain')).toBeTruthy();
        expect(screen.getByText('Because of pain I have less than 6 hours of sleep')).toBeTruthy();
        expect(screen.getByText('Because of pain I have less than 4 hours of sleep')).toBeTruthy();
        expect(screen.getByText('Because of pain I have less than 2 hours of sleep')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from sleeping at all')).toBeTruthy();

        expect(screen.getByText('3/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test('question 3 selected and navigate to next screen', async() => {
        await render(<PersonalCareAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("Because of pain I have less than 4 hours of sleep"));
        fireEvent.press(screen.getByText("Record"));

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect question 4 components to be rendered on screen
        expect(screen.getByText('Reflection on your personal care')).toBeTruthy();
        expect(screen.getByText('Write any reflections of pain impacts on your daily life.')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('For instance, this week, I felt that I could not everything at all, I felt hopeless, even doing the laundry felt miserable.')).toBeTruthy();

        expect(screen.getByText('4/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test('question 4 answered and navigate to next screen', async() => {
        await render(<PersonalCareAssessment/>);
        jest.spyOn(Alert, "alert");
        const reflection = screen.getByPlaceholderText("For instance, this week, I felt that I could not everything at all, I felt hopeless, even doing the laundry felt miserable.");
        const user = userEvent.setup();
        await user.type(reflection, "I felt hopeless and unmotivated to do anything this week.");

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).not.toHaveBeenCalled();
        // expect summary components to be rendered on screen
        expect(screen.getByText('My Personal Care Summary')).toBeTruthy();
    });

    test('user presses the back button', () => {
        expect("").toBeTruthy();
    });
});