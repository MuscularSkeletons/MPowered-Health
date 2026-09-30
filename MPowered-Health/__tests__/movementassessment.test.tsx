import { MovementAssessment } from '../src/app/(tabs)/(assessment)/movementassessment';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { movementQuestions } from "@/constants/assessment/questions";

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

describe("movement assessment questions are rendered on screen", () => {

    beforeEach(async() => {
        await render (<MovementAssessment/>);
    });

    afterEach(jest.clearAllMocks);
    
    test("question 1 (General Movement Impacts) is rendered on screen", () => {
        expect(screen.getByText('General Movement Impacts')).toBeTruthy();
        expect(screen.getByText('On average, how many hours per day were you able to stay active or mobile last week?')).toBeTruthy();
        // hours
        expect(screen.getByPlaceholderText('0')).toBeTruthy();

        expect(screen.getByText('Staying active could mean doing your typical activities, such as working, driving, doing household chores, or meeting with people')).toBeTruthy();

        expect(screen.getByText('1/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 2 (General Movement Impacts) is rendered on screen", () => {
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

    test("question 3 (Walking Impacts) is rendered on screen", () => {
        expect(screen.getByText('Walking Impacts')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('Pain does not prevent me walking any distance')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from walking more than 2 kilometres')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from walking more than 1 kilometre')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from walking more than 500 metres')).toBeTruthy();
        expect(screen.getByText('I can only walk using a stick or crutches')).toBeTruthy();
        expect(screen.getByText('I am in bed most of the time')).toBeTruthy();

        expect(screen.getByText('3/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 4 (Lifting Impacts) is rendered on screen", () => {
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

    test("question 5 (Sitting Impacts) is rendered on screen", () => {
        expect(screen.getByText('Sitting Impacts')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('I can sit in any chair as long as I like')).toBeTruthy();
        expect(screen.getByText('I can only sit in my favourite chair as long as I like')).toBeTruthy();
        expect(screen.getByText('Pain prevents me sitting more than one hour')).toBeTruthy();
        expect(screen.getByText('Pain prevents me sitting more than 30 minutes')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from sitting more than 10 minutes')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from sitting at all')).toBeTruthy();

        expect(screen.getByText('5/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 6 (Standing Impacts) is rendered on screen", () => {
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

    test("question 7 (Reflection) is rendered on screen", () => {
        expect(screen.getByText('Reflection on your movement')).toBeTruthy();
        expect(screen.getByText('Write any reflections of pain impacts on your mobility.')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('For instance, when pain occurred, you may have needed to lie down for the whole day.')).toBeTruthy();

        expect(screen.getByText('7/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

});