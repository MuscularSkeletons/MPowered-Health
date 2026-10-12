import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from '../src/app/(auth)/login';
import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

const SAVED_EMAIL_KEY = 'mpowered.saved-email';

const mockUser = jest.fn(() => Promise.resolve('mocked user'));
const mockSignIn = jest.fn();

jest.mock("@/context/authcontext", () => ({
    useAuth: () => ({
        user: mockUser,
        signIn: mockSignIn,
        signUp: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
        isLoading: false,
    }),
}))

jest.mock('@react-native-async-storage/async-storage', () => ({
    AsyncStorage: () => ({
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    })
}))


describe('The screen renders all the components properly', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })
    
    test('greeting message is rendered on screen',  async() => {
        await render (<Login/>);
        expect(screen.getByText("Welcome back!")).toBeTruthy();
        expect(screen.getByText("SIGN IN")).toBeTruthy();
        expect(screen.getByText("Sign in to continue your MPowered Health journey.")).toBeTruthy();

        //input fields
        expect(screen.getByText("Email address")).toBeTruthy();
        expect(screen.getByPlaceholderText("you@example.com")).toBeTruthy();
        expect(screen.getByText("Password")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter your password")).toBeTruthy();

        //buttons
        //todo: check if the below one passes
        expect(screen.getByRole("checkbox")).toBeTruthy();
        expect(screen.getByText("Remember my email address")).toBeTruthy();
        expect(screen.getByRole("button", {name: "Show Password"})).toBeTruthy();
        expect(screen.getByRole("button", {name: "Sign in"})).toBeTruthy();
        expect(screen.getByText("New to MPowered Health? Get started")).toBeTruthy();
        expect(screen.getByText("< Back")).toBeTruthy();
    })    
})

describe("input functionality", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("user can type in email", async() => {
        await render(<Login/>);
        const emailInput = screen.getByPlaceholderText("you@example.com");
        const user = userEvent.setup();
        await user.type(emailInput, "email-test@example.com");

        expect(emailInput.props.value).toBe("email-test@example.com");
    })

    test("user can type in password", async() => {
        await render(<Login/>);
        const passwordInput = screen.getByPlaceholderText("Enter your password");
        const user = userEvent.setup();
        await user.type(passwordInput, "Password123!");

        expect(passwordInput.props.value).toBe("Password123!");
    })
})

describe("checking empty input fields", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("continue button is disabled is input fields are empty", async() => {
        await render(<Login/>);

        expect(screen.getByRole("button", {name: "Sign in"})).toBeDisabled();
    })

    test("sign in button is disabled if email field is empty", async() => {
        await render(<Login/>);
        const passwordInput = screen.getByPlaceholderText("Enter your password");
        const user = userEvent.setup();
        await user.type(passwordInput, "Password123!");

        expect(screen.getByRole("button", {name: "Sign in"})).toBeDisabled();
    })

    test("sign in button is disabled if password field is empty", async() => {
        await render(<Login/>);
        const emailInput = screen.getByPlaceholderText("you@example.com");
        const user = userEvent.setup();
        await user.type(emailInput, "email-test@example.com");

        expect(screen.getByRole("button", {name: "Sign in"})).toBeDisabled();
    })
})

describe("sign in process and remembering email functionality", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    }) 

    //both tests are successful sign ins
    test("if remember email address is checked, save the email", async() => {
        await render(<Login/>);
        const emailInput = screen.getByPlaceholderText("you@example.com");
        const user = userEvent.setup();
        await user.type(emailInput, "email-test@example.com");
        const passwordInput = screen.getByPlaceholderText("Enter your password");
        await user.type(passwordInput, "Password123!");
        //default is true
        //fireEvent.press(screen.getByRole("checkbox"));
        fireEvent.press(screen.getByRole("button", {name: "Sign in"}));

        //calling sign in and saving the email address
        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith('email-test@example.com', 'Password123!');
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(SAVED_EMAIL_KEY, 'email-test@example.com');
        })
    })

    test("if remember email address is not checked, do not save the email", async() => {
        await render(<Login/>);
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("you@example.com");
        await user.type(emailInput, "email-test@example.com");
        const passwordInput = screen.getByPlaceholderText("Enter your password");
        await user.type(passwordInput, "Password123!");
        fireEvent.press(screen.getByRole("checkbox"));
        fireEvent.press(screen.getByRole("button", {name: "Sign in"}));

        //calling sign in but not saving the email address
        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith('email-test@example.com', 'Password123!');
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SAVED_EMAIL_KEY);
        })
    })
})

describe("password visibility", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("password is hidden by default", async() => {
        await render(<Login/>);
        const passwordInput = screen.getByPlaceholderText("Enter your password");
        expect(passwordInput.props.secureTextEntry).toBe(true);
    })

    test("clicking the eye button shows the password", async() => {
        await render(<Login/>);
        const user = userEvent.setup();
        const passwordInput = screen.getByPlaceholderText("Enter your password");
        const visibilityIcon = screen.getByRole("button", {name: "Show Password"});

        await user.type(passwordInput, "Password123!");
        expect(passwordInput.props.secureTextEntry).toBe(true);

        await fireEvent.press(visibilityIcon);
        expect(passwordInput.props.secureTextEntry).toBe(false);

    })

    test("clicking the eye button again hides the password", async() => {
        await render(<Login/>);
        const user = userEvent.setup();
        const passwordInput = screen.getByPlaceholderText("Enter your password");
        const visibilityIcon = screen.getByRole("button", {name: "Show Password"});

        await user.type(passwordInput, "Password123!");
        expect(passwordInput.props.secureTextEntry).toBe(true);

        await fireEvent.press(visibilityIcon);
        expect(passwordInput.props.secureTextEntry).toBe(false);

        await fireEvent.press(visibilityIcon);
        expect(passwordInput.props.secureTextEntry).toBe(true);
    })
})

//todo: navigation tests
describe("navigation tests", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing sign in navigates to dashboard", async() => {
        await render(<Login/>);
    })

    test("pressing get started navigates to sign up page", async() => {
        await render(<Login/>);
    })
})

describe('Authentication tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("successful login", async() => {
        await render(<Login/>);
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("you@example.com");
        await user.type(emailInput, "email-test@example.com");
        const passwordInput = screen.getByPlaceholderText("Enter your password");
        await user.type(passwordInput, "Password123!");
        fireEvent.press(screen.getByRole("button", {name: "Sign in"}));

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith('email-test@example.com', 'Password123!');
        })
    })


    test("throw an error if login process fails", async() => {
        await render(<Login/>);
        const spyAlert = jest.spyOn(Alert, 'alert');

        const loginError = new Error("Failed to login");
        mockSignIn.mockRejectedValueOnce(loginError);

        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("you@example.com");
        const passwordInput = screen.getByPlaceholderText("Enter your password");
        await user.type(emailInput, 'email-test@example.com');
        await user.type(passwordInput, 'Password123!');
        fireEvent.press(screen.getByRole("button", {name: "Sign in"}));

        await expect(mockSignIn).toHaveBeenCalled();

        expect(spyAlert).toHaveBeenCalledWith('Error', 'The email or password is incorrect.');
    })
})

//email and password validation will be manually tested
