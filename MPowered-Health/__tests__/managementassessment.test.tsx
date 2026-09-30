import { ManagementAssessment } from '../src/app/(tabs)/(assessment)/managementassessment';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { managementQuestions } from "@/constants/assessment/questions";

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

        expect(screen.getByText('1/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 2 (Medication) is rendered on screen", () => {
        expect(screen.getByText('Medication')).toBeTruthy();
        expect(screen.getByText('Over the past week, did you consume any over the counter (OTC) medication.')).toBeTruthy();
        expect(screen.getByText('Not taking OTC medications? Just click the record button')).toBeTruthy();
        // options
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