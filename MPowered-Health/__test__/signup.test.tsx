import Signup from '@/app/(auth)/signup';
import { fireEvent, render, screen, userEvent} from '@testing-library/react-native';

const mockUser = jest.fn(() => Promise.resolve('mocked user'));
const mockSignUp = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("@/context/authcontext", () => ({
    useAuth: () => ({
        user: mockUser,
        signIn: jest.fn(),
        signUp: mockSignUp,
        signOut: jest.fn(),
        updateUser: jest.fn(),
        isLoading: false,
    }),
}))

//mocking expo router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    })
}))

describe ('Sign up rendering', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('objects are rendered on screen',  async() => {
        await render (<Signup/>);
        expect(screen.getByText("GET STARTED")).toBeTruthy();
        expect(screen.getByText("Create your account")).toBeTruthy();
        expect(screen.getByText("Create your account, then tell us what matters for your health.")).toBeTruthy();

        //input fields
        expect(screen.getByText("Email address")).toBeTruthy();
        expect(screen.getByPlaceholderText("you@example.com")).toBeTruthy();
        expect(screen.getByText("Password")).toBeTruthy();
        expect(screen.getByPlaceholderText("Enter a password")).toBeTruthy();
        expect(screen.getByText("Confirm password")).toBeTruthy();
        expect(screen.getByPlaceholderText("Re-enter your password")).toBeTruthy();

        //buttons
        expect(screen.getByRole("button", {name: "Create account"})).toBeTruthy();
        expect(screen.getByText("Already have an account? Sign in")).toBeTruthy();
        expect(screen.getByRole("button", {name: "Show Password"})).toBeTruthy();
        expect(screen.getByRole("button", {name: "Show Confirm password"})).toBeTruthy();
        expect(screen.getByText("‹ Back")).toBeTruthy();
    })
})

describe("Input functionality", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("user can type email", async() => {
        await render(<Signup/>);
        const emailInput = screen.getByPlaceholderText("you@example.com");
        const user = userEvent.setup();
        await user.type(emailInput, "email-test@example.com");

        expect(emailInput.props.value).toBe("email-test@example.com");
    })

    test("user can type password", async() => {
        await render(<Signup/>);
        const passwordInput = screen.getByPlaceholderText("Enter a password");
        const user = userEvent.setup();
        await user.type(passwordInput, "Password123!");

        expect(passwordInput.props.value).toBe("Password123!");
    })

    test("user can type in password again to confirm it", async() => {
        await render(<Signup/>);
        const passwordInput = screen.getByPlaceholderText("Re-enter your password");
        const user = userEvent.setup();
        await user.type(passwordInput, "Password123!");

        expect(passwordInput.props.value).toBe("Password123!");
    })
})

describe("Checking required input fields", () => {
    test("create account button is disabled if all input fields are empty", async() => {
        await render(<Signup/>);
        expect(screen.getByRole("button", {name: "Create account"})).toBeDisabled();       
    })

    test("create account button is disabled if email input field is empty", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Enter a password"), "Password123!");
        await user.type(screen.getByPlaceholderText("Re-enter your password"), "Password123!");

        expect(screen.getByRole("button", {name: "Create account"})).toBeDisabled();           
    })

    test("create account button is disabled if password input field is empty", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("you@example.com"), "test-email@example.com");
        await user.type(screen.getByPlaceholderText("Re-enter your password"), "Password123!");

        expect(screen.getByRole("button", {name: "Create account"})).toBeDisabled();       
    })

    test("create account button is disabled if confirm password input field is empty", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("you@example.com"), "test-email@example.com");
        await user.type(screen.getByPlaceholderText("Enter a password"), "Password123!");

        expect(screen.getByRole("button", {name: "Create account"})).toBeDisabled();        
    })

    test("do not call sign up function if required input fields are missing", async() => {
        await render(<Signup/>);
        expect(screen.getByRole("button", {name: "Create account"})).toBeDisabled(); 
        expect(mockSignUp).not.toHaveBeenCalled();
    })
})

describe("Check password mismatches", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("show the inline error if passwords are not equal", async() => {
        await render (<Signup/>);
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("you@example.com");
        const passwordInput = screen.getByPlaceholderText("Enter a password");
        const confirmPasswordInput = screen.getByPlaceholderText("Re-enter your password");
        await user.type(emailInput, "test-email@example.com");
        await user.type(passwordInput, "Password123!");
        await user.type(confirmPasswordInput, "Password456!");

        expect(await screen.findByText("Passwords do not match.")).toBeVisible();

        expect(emailInput.props.value).toBe("test-email@example.com");
        expect(passwordInput.props.value).toBe("Password123!");
        expect(confirmPasswordInput.props.value).toBe("Password456!");

        expect(screen.getByRole("button", {name: "Create account"})).toBeDisabled();
    })

    test("do not show the inline error if passwords are equal", async() => {
        await render (<Signup/>);
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("you@example.com");
        const passwordInput = screen.getByPlaceholderText("Enter a password");
        const confirmPasswordInput = screen.getByPlaceholderText("Re-enter your password");
        await user.type(emailInput, "test-email@example.com");
        await user.type(passwordInput, "Password123!");
        await user.type(confirmPasswordInput, "Password123!");

        expect(emailInput.props.value).toBe("test-email@example.com");
        expect(passwordInput.props.value).toBe("Password123!");
        expect(confirmPasswordInput.props.value).toBe("Password123!");
        
        expect(await screen.queryByText("Passwords do not match.")).not.toBeVisible();
        expect(screen.getByRole("button", {name: "Create account"})).toBeEnabled();
    })

    test("remove the inline mismatch error when the passwords are corrected", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("you@example.com");
        const passwordInput = screen.getByPlaceholderText("Enter a password");
        const confirmPasswordInput = screen.getByPlaceholderText("Re-enter your password");
        await user.type(emailInput, "test-email@example.com");
        await user.type(passwordInput, "Password123!");
        await user.type(confirmPasswordInput, "Password456!");

        expect(await screen.findByText("Passwords do not match.")).toBeVisible();

        await user.clear(confirmPasswordInput);
        await user.type(confirmPasswordInput, "Password123!");

        expect(await screen.queryByText("Passwords do not match.")).not.toBeVisible();
    })
})

describe("Password visibility", () => {

    test("password is hidden by default", async() => {
        await render(<Signup/>);
        const passwordInput = screen.getByPlaceholderText("Enter a password");
        expect(passwordInput.props.secureTextEntry).toBe(true);
    })

    test("confirm password is hidden by default", async() => {
        await render(<Signup/>);
        const passwordInput = screen.getByPlaceholderText("Re-enter your password");
        expect(passwordInput.props.secureTextEntry).toBe(true);
    })

    test("clicking the eye button shows the password", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const passwordInput = screen.getByPlaceholderText("Enter a password");
        const visibilityIcon = screen.getByRole("button", {name: "Show Password"});

        await user.type(passwordInput, "Password123!");
        expect(passwordInput.props.secureTextEntry).toBe(true);

        await fireEvent.press(visibilityIcon);
        expect(passwordInput.props.secureTextEntry).toBe(false);

    })

    test("clicking the eye button again hides the password", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const passwordInput = screen.getByPlaceholderText("Enter a password");
        const visibilityShow = screen.getByRole("button", {name: "Show Password"});

        await user.type(passwordInput, "Password123!");
        expect(passwordInput.props.secureTextEntry).toBe(true);

        await fireEvent.press(visibilityShow);
        expect(passwordInput.props.secureTextEntry).toBe(false);

        const visibilityHide = screen.getByRole("button", {name: "Hide Password"});
        await fireEvent.press(visibilityHide);
        expect(passwordInput.props.secureTextEntry).toBe(true);
    })

    test("clicking the eye button shows the confirm password", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const passwordInput = screen.getByPlaceholderText("Re-enter your password");
        const visibilityIcon = screen.getByRole("button", {name: "Show Confirm password"});

        await user.type(passwordInput, "Password123!");
        expect(passwordInput.props.secureTextEntry).toBe(true);

        await fireEvent.press(visibilityIcon);
        expect(passwordInput.props.secureTextEntry).toBe(false);
    })

    test("clicking the eye button again hides the confirm password", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const passwordInput = screen.getByPlaceholderText("Re-enter your password");
        const visibilityShow = screen.getByRole("button", {name: "Show Confirm password"});

        await user.type(passwordInput, "Password123!");
        expect(passwordInput.props.secureTextEntry).toBe(true);

        await fireEvent.press(visibilityShow);
        expect(passwordInput.props.secureTextEntry).toBe(false);

        const visibilityHide = screen.getByRole("button", {name: "Hide Confirm password"});
        await fireEvent.press(visibilityHide);
        expect(passwordInput.props.secureTextEntry).toBe(true);
    })
})

describe ("Navigation to the correct screen", () => {

    test('navigate to login page when login in to another account is pressed', async() => {
        await render(<Signup/>);

        await fireEvent.press(screen.getByText("Already have an account? Sign in"));
        expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
    })

    //navigate to onboarding screen if successful input
    test("navigate to onboarding screen after successful account creation", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("you@example.com");
        const passwordInput = screen.getByPlaceholderText("Enter a password");
        const confirmPasswordInput = screen.getByPlaceholderText("Re-enter your password");
        await user.type(emailInput, "test-email@example.com");
        await user.type(passwordInput, "Password123!");
        await user.type(confirmPasswordInput, "Password123!");

        expect(screen.getByRole("button", {name: "Create account"})).toBeEnabled();
        fireEvent.press(screen.getByRole("button", {name: "Create account"}));
        await expect(mockSignUp).toHaveBeenCalledWith("test-email@example.com", "Password123!");
        expect(mockReplace).toHaveBeenCalledWith('/(auth)/(onboarding)/onboarding');
    })

    test("pressing back should navigate to splash screen", async() => {
        await render(<Signup/>);
        fireEvent.press(screen.getByText("‹ Back"));
        expect(mockReplace).toHaveBeenCalledWith('/(auth)/splashscreen');
    })
})

//password and email validation will be manually tested
