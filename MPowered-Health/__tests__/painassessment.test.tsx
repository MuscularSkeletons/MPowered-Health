import { PainAssessment } from '../src/app/(tabs)/(assessment)/painassessment';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { painQuestions } from "@/constants/assessment/questions";
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

// selection/input tests
describe("my pain assessment questions are selected/inputted correctly", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("question 1 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<PainAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("can input text for question 1 option other", async() => {
        await render(<PainAssessment/>);
        fireEvent.press(screen.getByText("Other"));
        const otherInput = screen.getByPlaceholderText("Input other pain location");
        const user = userEvent.setup();
        await user.type(otherInput, "Inner thigh");
    });

    test("question 2 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<PainAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    // TODO: check how Q3-6 implemented in assessment
    test("question 3 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<PainAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });
    
    test("question 4 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<PainAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 5 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<PainAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 6 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<PainAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

});

// input validation tests
describe("input validation for question 1 other", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // question 1 is mandatory
    test("no text is entered for question 1 other", async() => {
        jest.spyOn(Alert, "alert");
        await render(<PainAssessment/>);
        fireEvent.press(screen.getByText("Other"));

        fireEvent.press(screen.getByText("OK"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });
});

// navigation tests
describe("navigation", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('question 1 selected and navigate to next screen', async() => {
        await render(<PainAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("Head"));
        fireEvent.press(screen.getByText("Record"));

        expect(Alert.alert).not.toHaveBeenCalled(); 
        
        // expect question 2 components to be rendered on screen
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

    test('question 1 other answered and navigate to next screen', async() => {
        await render(<PainAssessment/>);
        jest.spyOn(Alert, "alert");
        const otherInput = screen.getByPlaceholderText("Input other pain location");
        const user = userEvent.setup();
        await user.type(otherInput, "Inner thigh");

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).not.toHaveBeenCalled();
        // expect question 2 components to be rendered on screen
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

    test('question 2 selected and navigate to next screen', async() => {
        await render(<PainAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("Throbbing"));
        fireEvent.press(screen.getByText("Record"));

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect question 3 components to be rendered on screen
        expect(screen.getByText('Pain intensity')).toBeTruthy();
        expect(screen.getByText('My current pain is')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('3/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test('question 3 selected and navigate to next screen', async() => {
        await render(<PainAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("2")); 
        fireEvent.press(screen.getByText("Record"));
        

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect question 4 components to be rendered on screen
        expect(screen.getByText('Pain intensity')).toBeTruthy();
        expect(screen.getByText('My mildest pain last week was')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('4/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test('question 4 selected and navigate to next screen', async() => {
        await render(<PainAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("2")); 
        fireEvent.press(screen.getByText("Record"));
        

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect question 5 components to be rendered on screen
        expect(screen.getByText('Pain intensity')).toBeTruthy();
        expect(screen.getByText('My worst pain last week was')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('5/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test('question 5 selected and navigate to next screen', async() => {
        await render(<PainAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("2")); 
        fireEvent.press(screen.getByText("Record"));
        

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect question 6 components to be rendered on screen
        expect(screen.getByText('Pain intensity')).toBeTruthy();
        expect(screen.getByText('My overall average pain last week was')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('6/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test('question 6 selected and navigate to next screen', async() => {
        await render(<PainAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("2")); 
        fireEvent.press(screen.getByText("Record"));
        

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect summary components to be rendered on screen
        expect(screen.getByText('My Pain Summary')).toBeTruthy();
    });
});