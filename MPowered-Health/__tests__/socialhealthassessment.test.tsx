import { SocialHealthAssessment } from '../src/app/(tabs)/(assessment)/socialhealthassessment';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { socialHealthQuestions } from "@/constants/assessment/questions";
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

// selection/input tests
describe("my social health assessment questions are selected/inputted correctly", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("question 1 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<SocialHealthAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 2 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<SocialHealthAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    // TODO: see how Q3-5 implemented
    test("question 3 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<SocialHealthAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });
    
    test("question 4 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<SocialHealthAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 5 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<SocialHealthAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 6 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<SocialHealthAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 7 answer can be entered", async() => {
        await render(<SocialHealthAssessment/>);
        const moodReason = screen.getByPlaceholderText("i.e: delays in work due to pain or inability to meet with friends, etc.");
        const user = userEvent.setup();
        await user.type(moodReason, "No friends.");

        expect(moodReason.props.value).toBe("No friends.");
    });

});

// input validation tests
describe("input validation for question 7", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // question 7 is optional
    test("no text is entered for question 7", async() => {
        jest.spyOn(Alert, "alert");
        await render(<SocialHealthAssessment/>);

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).not.toHaveBeenCalled(); // optional question
    });
});

// navigation tests
describe("navigation", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('question 1 selected and navigate to next screen', async() => {
        await render(<SocialHealthAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("My social life is normal and gives me no extra pain"));
        fireEvent.press(screen.getByText("Record"));

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect question 2 components to be rendered on screen
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

    test('question 2 selected and navigate to next screen', async() => {
        await render(<SocialHealthAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("I can travel anywhere without pain"));
        fireEvent.press(screen.getByText("Record"));

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect question 3 components to be rendered on screen
        expect(screen.getByText('Mood')).toBeTruthy();
        expect(screen.getByText('Over the past week, how much has pain impacted your mood?')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('3/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test('question 3 selected and navigate to next screen', async() => {
        await render(<SocialHealthAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("3")); 
        fireEvent.press(screen.getByText("Record"));
        

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect question 4 components to be rendered on screen
        expect(screen.getByText('Relation with others')).toBeTruthy();
        expect(screen.getByText('Over the past week, how much has pain interfered with your relationships with other people?')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('4/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test('question 4 selected and navigate to next screen', async() => {
        await render(<SocialHealthAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("3"));
        fireEvent.press(screen.getByText("Record"));
        

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect question 5 components to be rendered on screen
        expect(screen.getByText('Enjoyment of life')).toBeTruthy();
        expect(screen.getByText('Over the past week, how much has pain impacted your ability to enjoy life?')).toBeTruthy();
        // score
        expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();

        expect(screen.getByText('5/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test('question 5 selected and navigate to next screen', async() => {
        await render(<SocialHealthAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("3"));
        fireEvent.press(screen.getByText("Record"));
        

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect question 6 components to be rendered on screen
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

    test('question 6 selected and navigate to next screen', async() => {
        await render(<SocialHealthAssessment/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("I was feeling sad")); 
        fireEvent.press(screen.getByText("Record"));
        

        expect(Alert.alert).not.toHaveBeenCalled(); 
        // expect question 7 components to be rendered on screen
        expect(screen.getByText('Mood')).toBeTruthy();
        expect(screen.getByText('What triggered that mood?')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('i.e: delays in work due to pain or inability to meet with friends, etc.')).toBeTruthy();

        expect(screen.getByText('7/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test('question 7 answered and navigate to next screen', async() => {
        await render(<SocialHealthAssessment/>);
        jest.spyOn(Alert, "alert");
        const moodReason = screen.getByPlaceholderText("i.e: delays in work due to pain or inability to meet with friends, etc.");
        const user = userEvent.setup();
        await user.type(moodReason, "No friends.");

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).not.toHaveBeenCalled();
        // expect summary components to be rendered on screen
        expect(screen.getByText('My Social Health Summary')).toBeTruthy();
    });

    test('user presses the back button', () => {
        expect("").toBeTruthy();
    });
});