import StoreName from '../src/app/(auth)/(onboarding)/name';
import {render, screen, fireEvent, userEvent} from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockUser = jest.fn(() => Promise.resolve('mocked user'));
const mockUpdateUserDraft = jest.fn();

jest.mock("@/context/authcontext", () => ({
    useAuth: () => ({
        user: mockUser,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
        updateUserDraft: mockUpdateUserDraft,
        isLoading: false,
    }),
}))

describe("rendering objects on screen", () => {

    test("screen objects are rendered on screen", async() => {
        await render(<StoreName/>);

        expect(screen.getByText("YOUR PROFILE")).toBeTruthy();
        expect(screen.getByText("1 of 6")).toBeTruthy();
        expect(screen.getByText("Your name")).toBeTruthy();
        expect(screen.getByText("Your health and wellbeing are uniquely you. Your name helps us address you personally.")).toBeTruthy();
        expect(screen.getByText("Name")).toBeTruthy();        
        expect(screen.getByPlaceholderText("Type your name")).toBeTruthy();
        expect(screen.getByRole("button", {name:"Continue"})).toBeTruthy();
        expect(screen.getByText("< Back")).toBeTruthy();
    });

})

describe("input fields", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("user is able to type in the input field", async() => {
        await render(<StoreName/>);
        const nameInput = screen.getByPlaceholderText("Type your name");
        const user = userEvent.setup();

        await user.type(nameInput, "Jane");
        fireEvent.press(screen.getByRole("button", {name:"Continue"}));
        expect(nameInput.props.value).toBe("Jane");
    })

    test("continue button should be disabled if no name is entered", async() => {
        await render(<StoreName/>);

        expect(screen.getByRole("button", {name: "Continue"})).toBeDisabled();
    })

    test("continue button should be enabled if a name is entered", async() => {
        await render(<StoreName/>);
        const nameInput = screen.getByPlaceholderText("Type your name");
        const user = userEvent.setup();

        await user.type(nameInput, "Jane");

        expect(screen.getByRole("button", {name: "Continue"})).toBeEnabled();
    })
})

describe("name validation", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("throw an error for name containing only white spaces", async() => {
        const spyAlert = jest.spyOn(Alert, "alert");
        await render(<StoreName/>);

        const nameInput = screen.getByPlaceholderText("Type your name");
        const user = userEvent.setup();

        await user.type(nameInput, " ");
        fireEvent.press(screen.getByRole("button", {name:"Continue"}));
        expect(spyAlert).toHaveBeenCalledWith('Error', 'Please enter your name');

    })

    test("successfully enter the name" , async() => {
        await render(<StoreName/>);

        const nameInput = screen.getByPlaceholderText("Type your name");
        const user = userEvent.setup();

        const userName = "Jane";
        await user.type(nameInput, userName);

        fireEvent.press(screen.getByRole("button", {name:"Continue"}));   
        expect(mockUpdateUserDraft).toHaveBeenCalledWith({name: userName});
    })

    test("for a name with a whitespace, remove the whitespace and save the name", async() => {
        await render(<StoreName/>);

        const nameInput = screen.getByPlaceholderText("Type your name");
        const user = userEvent.setup();

        const userName = "Jane ";
        await user.type(nameInput, userName);

        fireEvent.press(screen.getByRole("button", {name:"Continue"})); 
        expect(mockUpdateUserDraft).toHaveBeenCalledWith({name: userName.trim()});
    })
})

//todo: navigation
describe("navigation", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing continue navigates to the next screen", async() => {
        await render(<StoreName/>);
        //todo: navigate to next screen
    })

    test("pressing back navigates to the previous screen", async() => {
        await render(<StoreName/>);
        //todo: navigate to splash screen
    })
})





