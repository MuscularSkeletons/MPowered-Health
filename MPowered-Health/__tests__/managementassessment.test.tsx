import { ManagementAssessment } from '../src/app/(tabs)/(assessment)/managementassessment';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { managementQuestions } from "@/constants/assessment/questions";
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
describe("my management assessment questions are rendered on screen", () => {

    beforeEach(async() => {
        await render (<ManagementAssessment/>);
    });

    afterEach(jest.clearAllMocks);
    
    test("question 1 (Medication) is rendered on screen", () => {
        expect(screen.getByText('Medication')).toBeTruthy();
        expect(screen.getByText('Over the past week, select medications that you consumed to manage your pain.')).toBeTruthy();
        expect(screen.getByText('Not taking medications? Just click the record button')).toBeTruthy();
        expect(screen.getByText('Generated based on your medication scripts')).toBeTruthy();
        // options
        // TODO: when see how assessment is implemented
        expect(screen.getByText('1/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 2 (Medication) is rendered on screen", () => {
        expect(screen.getByText('Medication')).toBeTruthy();
        expect(screen.getByText('Over the past week, did you consume any over the counter (OTC) medication.')).toBeTruthy();
        expect(screen.getByText('Not taking OTC medications? Just click the record button')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('Input name of over the counter medication')).toBeTruthy();

        expect(screen.getByText('2/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 3 (Exercise) is rendered on screen", () => {
        expect(screen.getByText('Exercise')).toBeTruthy();
        expect(screen.getByText('In the past 7 days, did you perform any exercises to manage your musculoskeletal pain or improve your movement?')).toBeTruthy();
        expect(screen.getByText('Examples: walking, stretching, strengthening, yoga, resistance band work, or balance exercises.')).toBeTruthy();
        // options
        expect(screen.getByText('0 days')).toBeTruthy();
        expect(screen.getByText('1-2 days')).toBeTruthy();
        expect(screen.getByText('3-4 days')).toBeTruthy();
        expect(screen.getByText('5-6 days')).toBeTruthy();
        expect(screen.getByText('7 days')).toBeTruthy();

        expect(screen.getByText('3/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 4 (Emotion) is rendered on screen", () => {
        expect(screen.getByText('Emotion')).toBeTruthy();
        expect(screen.getByText('Over the past week, did you perform any strategies to manage your stress level or emotion?')).toBeTruthy();
        expect(screen.getByText('Examples: meditation, journaling, meeting people')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('Examples: meditation, journaling, meeting people')).toBeTruthy();

        expect(screen.getByText('4/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

});

// selection/input tests
describe("my management assessment questions are selected/inputted correctly", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("question 1 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<ManagementAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 2 answer can be entered", async() => {
        await render(<ManagementAssessment/>);
        const otcMedication = screen.getByPlaceholderText("Input name of over the counter medication");
        const user = userEvent.setup();
        await user.type(otcMedication, "Ibuprofen");

        expect(otcMedication.props.value).toBe("Ibuprofen");
    });

    test("question 3 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<ManagementAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 4 answer can be entered", async() => {
        await render(<ManagementAssessment/>);
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
});

// navigation tests
describe("navigation", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('question 1 selected and navigate to next screen', async() => {
        await render(<ManagementAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("Perindopril")); // TODO: when assessment is implemented
        fireEvent.press(screen.getByText("Record"));

        expect(Alert.alert).not.toHaveBeenCalled(); 
        //todo: navigate to next page
        expect("").toBeTruthy();
    });

    test('question 2 answered and navigate to next screen', async() => {
        await render(<ManagementAssessment/>);
        jest.spyOn(Alert, "alert");
        const otcMedication = screen.getByPlaceholderText("Input name of over the counter medication");
        const user = userEvent.setup();
        await user.type(otcMedication, "Ibuprofen");

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).not.toHaveBeenCalled();
        //todo: navigate to next page
    });

    test('question 3 selected and navigate to next screen', async() => {
        await render(<ManagementAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("0 days"));
        fireEvent.press(screen.getByText("Record"));

        expect(Alert.alert).not.toHaveBeenCalled(); 
        //todo: navigate to next page
        expect("").toBeTruthy();
    });

    test('question 4 answered and navigate to next screen', async() => {
        await render(<ManagementAssessment/>);
        jest.spyOn(Alert, "alert");
        const emotionStrategies = screen.getByPlaceholderText("Examples: meditation, journaling, meeting people");
        const user = userEvent.setup();
        await user.type(emotionStrategies, "Meditation");

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).not.toHaveBeenCalled();
        //todo: navigate to next page
    });

    test('user presses the back button', () => {
        expect("").toBeTruthy();
    });
});