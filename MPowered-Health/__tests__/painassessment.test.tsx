import { PainAssessment } from '../src/app/(tabs)/index';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { painQuestions } from "@/constants/assessment/questions";

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

describe("pain assessment questions are rendered on screen", () => {

    beforeEach(async() => {
        await render (<PainAssessment/>);
    });

    afterEach(jest.clearAllMocks);
    
    test("question 1 (pain location) is rendered on screen", () => {
        expect(screen.getByText('Pain location')).toBeTruthy();
        expect(screen.getByText('I have had pain in these areas last week.')).toBeTruthy();
        expect(screen.getByText('(scroll down for more options)')).toBeTruthy();
        // options
        expect(screen.getByText('Head')).toBeTruthy();
        expect(screen.getByText('Neck')).toBeTruthy();
        expect(screen.getByText('Shoulder')).toBeTruthy();
        expect(screen.getByText('Upper Back')).toBeTruthy();
        expect(screen.getByText('Lower Back')).toBeTruthy();
        expect(screen.getByText('Leg')).toBeTruthy();
        expect(screen.getByText('Hip')).toBeTruthy();
        expect(screen.getByText('Buttock')).toBeTruthy();
        expect(screen.getByText('Knee')).toBeTruthy();
        expect(screen.getByText('Other')).toBeTruthy();

        expect(screen.getByText('1/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 2 (pain characteristics) is rendered on screen", () => {
        expect(screen.getByText('Pain characteristics')).toBeTruthy();
        expect(screen.getByText('For each of the following words, select the adjectives that apply to your pain.')).toBeTruthy();
        expect(screen.getByText('(scroll down for more options)')).toBeTruthy();
        // options
        expect(screen.getByText('Aching')).toBeTruthy();
        expect(screen.getByText('Throbbing')).toBeTruthy();
        expect(screen.getByText('Shooting')).toBeTruthy();
        expect(screen.getByText('Stabbing')).toBeTruthy();
        expect(screen.getByText('Gnawing')).toBeTruthy();
        expect(screen.getByText('Sharp')).toBeTruthy();
        expect(screen.getByText('Tender')).toBeTruthy();
        expect(screen.getByText('Burning')).toBeTruthy();
        expect(screen.getByText('Exhausting')).toBeTruthy();
        expect(screen.getByText('Tiring')).toBeTruthy();
        expect(screen.getByText('Penetrating')).toBeTruthy();
        expect(screen.getByText('Nagging')).toBeTruthy();
        expect(screen.getByText('Numb')).toBeTruthy();
        expect(screen.getByText('Miserable')).toBeTruthy();
        expect(screen.getByText('Unbearable')).toBeTruthy();

        expect(screen.getByText('2/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    }); 

    test("question 3 (pain intensity) is rendered on screen", () => {
        expect(screen.getByText('Pain intensity')).toBeTruthy();
        expect(screen.getByText('My current pain is')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('3/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 4 (pain intensity) is rendered on screen", () => {
        expect(screen.getByText('Pain intensity')).toBeTruthy();
        expect(screen.getByText('My mildest pain last week was')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('4/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 5 (pain intensity) is rendered on screen", () => {
        expect(screen.getByText('Pain intensity')).toBeTruthy();
        expect(screen.getByText('My worst pain last week was')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('5/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 6 (pain intensity) is rendered on screen", () => {
        expect(screen.getByText('Pain intensity')).toBeTruthy();
        expect(screen.getByText('My overall average pain last week was')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('6/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });


});