import { SocialHealthAssessment } from '../src/app/(tabs)/(assessment)/socialhealthassessment';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { socialHealthQuestions } from "@/constants/assessment/questions";

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

describe("social health assessment questions are rendered on screen", () => {

    beforeEach(async() => {
        await render (<SocialHealthAssessment/>);
    });

    afterEach(jest.clearAllMocks);
    
    test("question 1 (Social life) is rendered on screen", () => {
        expect(screen.getByText('Social life')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('My social life is normal and gives me no extra pain')).toBeTruthy();
        expect(screen.getByText('My social life is normal but increases the degree of pain')).toBeTruthy();
        expect(screen.getByText('Pain has no significant effect on my social life apart from limiting my more energetic interests, such as gym or sports')).toBeTruthy();
        expect(screen.getByText('Pain has restricted my social life and I do not go out as often')).toBeTruthy();
        expect(screen.getByText('Pain has restricted my social life to my home')).toBeTruthy();
        expect(screen.getByText('I have no social life because of pain')).toBeTruthy();

        expect(screen.getByText('1/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 2 (Travelling) is rendered on screen", () => {
        expect(screen.getByText('Travelling')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('I can travel anywhere without pain')).toBeTruthy();
        expect(screen.getByText('I can travel anywhere, but it gives me extra pain')).toBeTruthy();
        expect(screen.getByText('Pain is bad, but I manage journeys over two hours')).toBeTruthy();
        expect(screen.getByText('Pain restricts me to journeys of less than one hour')).toBeTruthy();
        expect(screen.getByText('Pain restricts me to short necessary journeys under 30 minutes')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from travelling except to receive treatment')).toBeTruthy();

        expect(screen.getByText('2/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    }); 

    test("question 3 (Mood) is rendered on screen", () => {
        expect(screen.getByText('Mood')).toBeTruthy();
        expect(screen.getByText('Over the past week, how much has pain impacted your mood?')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('3/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 4 (Relation with others) is rendered on screen", () => {
        expect(screen.getByText('Relation with others')).toBeTruthy();
        expect(screen.getByText('Over the past week, how much has pain interfered with your relationships with other people?')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('4/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 5 (Enjoyment of life) is rendered on screen", () => {
        expect(screen.getByText('Enjoyment of life')).toBeTruthy();
        expect(screen.getByText('Over the past week, how much has pain impacted your ability to enjoy life?')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('5/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 6 (Mood) is rendered on screen", () => {
        expect(screen.getByText('Mood')).toBeTruthy();
        expect(screen.getByText('Over the past week, how was your mood generally?')).toBeTruthy();
        expect(screen.getByText('Tap below the emoji that best describes your mood.')).toBeTruthy();
        // options - to adjust to how it's actually implemented
        expect(screen.getByText('I was feeling frustrated')).toBeTruthy();
        expect(screen.getByText('I was feeling sad')).toBeTruthy();
        expect(screen.getByText('I was feeling okay')).toBeTruthy();
        expect(screen.getByText('I was feeling calm')).toBeTruthy();
        expect(screen.getByText('I was feeling delighted')).toBeTruthy();

        expect(screen.getByText('6/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 7 (Mood) is rendered on screen", () => {
        expect(screen.getByText('Mood')).toBeTruthy();
        expect(screen.getByText('What triggered that mood?')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('i.e: delays in work due to pain or inability to meet with friends, etc.')).toBeTruthy();

        expect(screen.getByText('7/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

});