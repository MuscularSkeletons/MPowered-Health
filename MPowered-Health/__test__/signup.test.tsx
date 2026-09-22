jest.mock("@/context/authcontext", () => ({
    useAuth: () => ({
        user: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
        isLoading: false,
    }),
}))

import Signup from '../src/app/(auth)/signup';
import Login from '../src/app/(auth)/login';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import {renderRouter} from 'expo-router/testing-library';
import { Alert } from 'react-native';

jest.spyOn(Alert, "alert");

describe ('Sign up rendering', () => {

    beforeEach(async () => {
        await render (<Signup/>);
    })

    afterEach(jest.clearAllMocks);

    test('signup message is rendered on screen',  () => {
        expect(screen.getByText("SIGN UP")).toBeTruthy();
    })

    //input fields
    test('email input field is rendered on screen', () => {
        expect(screen.getByPlaceholderText("Email")).toBeTruthy();
    })

    test('password input field is rendered on screen', () => {
        expect(screen.getByPlaceholderText("Password")).toBeTruthy();
    })

    test('confirm password input field is rendered on screen', () => {
        expect(screen.getByPlaceholderText("Confirm Password")).toBeTruthy();
    })

    test('login button is rendered on screen',  () => {
        expect(screen.getByText("Log in to a different account")).toBeTruthy();
    })

    test('signup button is rendered on screen',  () => {
        expect(screen.getByText("SIGN UP")).toBeTruthy();
    })
    
    //password visibility button
    test("password visibility icon is rendered", () => {
        expect(screen.getByTestId('toggle-password-icon')).toBeTruthy();
    })
    
    test("confirm password visibility icon is rendered", () => {
        expect(screen.getByTestId('toggle-confirm-password-icon')).toBeTruthy();
    })

})

describe("Input functionality", () => {

    beforeEach(async () => {
        await render (<Signup/>);
    })

    afterEach(jest.clearAllMocks);

    test("user can type email", async() => {
        const emailInput = screen.getByPlaceholderText("Email");
        const user = userEvent.setup();
        await user.type(emailInput, "email-test@example.com");

        expect(emailInput.props.value).toBe("email-test@example.com");
    })

    test("user can type password", async() => {
        const passwordInput = screen.getByPlaceholderText("Password");
        const user = userEvent.setup();
        await user.type(passwordInput, "Password123!");

        expect(passwordInput.props.value).toBe("Password123!");
    })

    test("user can type in password again to confirm it", async() => {
        const passwordInput = screen.getByPlaceholderText("Confirm Password");
        const user = userEvent.setup();
        await user.type(passwordInput, "Password123!");

        expect(passwordInput.props.value).toBe("Password123!");
    })
})

describe("Check empty input fields", () => {
    test("all input fields are empty", async() => {
        await render(<Signup/>);

        fireEvent.press(screen.getByText("SIGNUP"));
        //console.log(screen.getByPlaceholderText("Email").props.value);
        //console.log(screen.getByPlaceholderText("Password").props.value);
        //console.log(screen.getByPlaceholderText("Confirm Password").props.value);

        expect(Alert.alert).toHaveBeenCalledWith("Error", "Please fill in all fields");        
    })

    test("email input field is empty", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Password"), "Password123!");
        await user.type(screen.getByPlaceholderText("Confirm Password"), "Password123!");

        fireEvent.press(screen.getByText("SIGNUP"));
        //console.log(screen.getByPlaceholderText("Email").props.value);
        //console.log(screen.getByPlaceholderText("Password").props.value);
        //console.log(screen.getByPlaceholderText("Confirm Password").props.value);

        expect(Alert.alert).toHaveBeenCalledWith("Error", "Please fill in all fields");        
    })

    test("password input field is empty", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Email"), "test-email@example.com");
        await user.type(screen.getByPlaceholderText("Confirm Password"), "Password123!");

        fireEvent.press(screen.getByText("SIGNUP"));
        //console.log(screen.getByPlaceholderText("Email").props.value);
        //console.log(screen.getByPlaceholderText("Password").props.value);
        //console.log(screen.getByPlaceholderText("Confirm Password").props.value);

        expect(Alert.alert).toHaveBeenCalledWith("Error", "Please fill in all fields");        
    })

    test("confirm password input field is empty", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Email"), "test-email@example.com");
        await user.type(screen.getByPlaceholderText("Password"), "Password123!");


        fireEvent.press(screen.getByText("SIGNUP"));
        //console.log(screen.getByPlaceholderText("Email").props.value);
        //console.log(screen.getByPlaceholderText("Password").props.value);
        //console.log(screen.getByPlaceholderText("Confirm Password").props.value);

        expect(Alert.alert).toHaveBeenCalledWith("Error", "Please fill in all fields");        
    })
})

describe("Check password mismatches", () => {

    beforeEach(async () => {
        await render (<Signup/>);
    })

    afterEach(jest.clearAllMocks);

    test("passwords are not equal", async() => {
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
        await user.type(emailInput, "test-email@example.com");
        await user.type(passwordInput, "Password123!");
        await user.type(confirmPasswordInput, "Password456!");

        expect(await screen.findByText("Passwords are not equal")).toBeVisible();

        fireEvent.press(screen.getByText("SIGNUP"));

        expect(emailInput.props.value).toBe("test-email@example.com");
        expect(passwordInput.props.value).toBe("Password123!");
        expect(confirmPasswordInput.props.value).toBe("Password456!");
        //console.log(Alert.alert);
        //console.log(passwordInput.props.value);
        //console.log(confirmPasswordInput.props.value);

        expect(Alert.alert).toHaveBeenCalledWith("Error", "Please enter the same password");
    })

    test("passwords are equal", async() => {
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
        await user.type(emailInput, "test-email@example.com");
        await user.type(passwordInput, "Password123!");
        await user.type(confirmPasswordInput, "Password123!");

        fireEvent.press(screen.getByText("SIGNUP"));

        expect(emailInput.props.value).toBe("test-email@example.com");
        expect(passwordInput.props.value).toBe("Password123!");
        expect(confirmPasswordInput.props.value).toBe("Password123!");
        //console.log(Alert.alert);
        //console.log(passwordInput.props.value);
        //console.log(confirmPasswordInput.props.value);

        expect(Alert.alert).not.toHaveBeenCalled();   
    })
})

//------------------------------------------------
// this test doesnt pass as the error is thrown from supabase and not from our code
// do not know how to mock the database error here
//------------------------------------------------
describe("Password Validation", () => {
    //ensuring that the password follows the requirements
    //password must be at least 8 charaacters, a number, a symbol, one lowercase and an uppercase

    afterEach(jest.clearAllMocks);

    test("password is all lowercase" , async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
        await user.type(emailInput, "test-email@example.com");
        await user.type(passwordInput, "password");
        await user.type(confirmPasswordInput, "password");

        fireEvent.press(screen.getByText("SIGNUP"));

        expect(Alert.alert).toHaveBeenCalledWith("Error", "Password must be at least 8 characters and include a number and a symbol, a lowercase and uppercase letter.");
    })

    test("password is all uppercase", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
        await user.type(emailInput, "test-email@example.com");
        await user.type(passwordInput, "PASSWORD");
        await user.type(confirmPasswordInput, "PASSWORD");

        fireEvent.press(screen.getByText("SIGNUP"));

        expect(Alert.alert).toHaveBeenCalledWith("Error", "Password must be at least 8 characters and include a number and a symbol, a lowercase and uppercase letter.");
    })

        test("password does not have a number", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
        await user.type(emailInput, "test-email@example.com");
        await user.type(passwordInput, "Password!");
        await user.type(confirmPasswordInput, "Password!");

        fireEvent.press(screen.getByText("SIGNUP"));

        expect(Alert.alert).toHaveBeenCalledWith("Error", "Password must be at least 8 characters and include a number and a symbol, a lowercase and uppercase letter.");
    })

        test("password does not have a special symbol", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
        await user.type(emailInput, "test-email@example.com");
        await user.type(passwordInput, "Password1");
        await user.type(confirmPasswordInput, "Password1");

        fireEvent.press(screen.getByText("SIGNUP"));

        expect(Alert.alert).toHaveBeenCalledWith("Error", "Password must be at least 8 characters and include a number and a symbol, a lowercase and uppercase letter.");
    })

        test("password is less than 8 characters long", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
        await user.type(emailInput, "test-email@example.com");
        await user.type(passwordInput, "Pass1!");
        await user.type(confirmPasswordInput, "Pass1!");

        fireEvent.press(screen.getByText("SIGNUP"));

        expect(Alert.alert).toHaveBeenCalledWith("Error", "Password must be at least 8 characters and include a number and a symbol, a lowercase and uppercase letter.");
    })

        test("valid password does not throw an alert", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
        await user.type(emailInput, "test-email@example.com");
        await user.type(passwordInput, "Password1!");
        await user.type(confirmPasswordInput, "Password1!");

        fireEvent.press(screen.getByText("SIGNUP"));

        expect(Alert.alert).not.toHaveBeenCalled();
    })
})

//same issue with supabase here 
describe("Email Validation", () => {
    //email format

    beforeEach(async() => {
        await render(<Signup/>);
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    test("valid email does not throw an alert", async() => {
        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Email"), "email-test@example.com");
        await user.type(screen.getByPlaceholderText("Password"), "Password1!");
        await user.type(screen.getByPlaceholderText("Confirm Password"), "Password1!");

        fireEvent.press(screen.getByText("SIGNUP"));
        expect(Alert.alert).not.toHaveBeenCalled();
    })
    
    test("email is missing @ symbol", async() => {
        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Email"), "email-test");
        await user.type(screen.getByPlaceholderText("Password"), "Password1!");
        await user.type(screen.getByPlaceholderText("Confirm Password"), "Password1!");

        fireEvent.press(screen.getByText("SIGNUP"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "That email address looks invalid. Double-check the format."); 
    })

    test("email is missing the domain", async() => {
        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Email"), "email-test@example");
        await user.type(screen.getByPlaceholderText("Password"), "Password1!");
        await user.type(screen.getByPlaceholderText("Confirm Password"), "Password1!");

        fireEvent.press(screen.getByText("SIGNUP"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "That email address looks invalid. Double-check the format.");
    })

    test("email is missing the username", async() => {
        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Email"), "@example.com");
        await user.type(screen.getByPlaceholderText("Password"), "Password1!");
        await user.type(screen.getByPlaceholderText("Confirm Password"), "Password1!");

        fireEvent.press(screen.getByText("SIGNUP"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "That email address looks invalid. Double-check the format.");
    })

    test("email has white spaces", async() => {
        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Email"), "email test@example.com");
        await user.type(screen.getByPlaceholderText("Password"), "Password1!");
        await user.type(screen.getByPlaceholderText("Confirm Password"), "Password1!");

        fireEvent.press(screen.getByText("SIGNUP"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "That email address looks invalid. Double-check the format.");
    })
})

describe("Password visibility", () => {

    test("password is hidden by default", async() => {
        await render(<Signup/>);
        const passwordInput = screen.getByPlaceholderText("Password");
        expect(passwordInput.props.secureTextEntry).toBe(true);
    })

    test("confirm password is hidden by default", async() => {
        await render(<Signup/>);
        const passwordInput = screen.getByPlaceholderText("Confirm Password");
        expect(passwordInput.props.secureTextEntry).toBe(true);
    })

    test("clicking the eye button shows the password", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const passwordInput = screen.getByPlaceholderText("Password");
        const visibilityIcon = screen.getByTestId('toggle-password-icon');

        await user.type(passwordInput, "Password123!");
        expect(passwordInput.props.secureTextEntry).toBe(true);

        await fireEvent.press(visibilityIcon);
        expect(passwordInput.props.secureTextEntry).toBe(false);

    })

    test("clicking the eye button again hides the password", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const passwordInput = screen.getByPlaceholderText("Password");
        const visibilityIcon = screen.getByTestId('toggle-password-icon');

        await user.type(passwordInput, "Password123!");
        expect(passwordInput.props.secureTextEntry).toBe(true);

        await fireEvent.press(visibilityIcon);
        expect(passwordInput.props.secureTextEntry).toBe(false);

        await fireEvent.press(visibilityIcon);
        expect(passwordInput.props.secureTextEntry).toBe(true);
    })

    test("clicking the eye button shows the confirm password", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const passwordInput = screen.getByPlaceholderText("Confirm Password");
        const visibilityIcon = screen.getByTestId('toggle-confirm-password-icon');

        await user.type(passwordInput, "Password123!");
        expect(passwordInput.props.secureTextEntry).toBe(true);

        await fireEvent.press(visibilityIcon);
        expect(passwordInput.props.secureTextEntry).toBe(false);
    })

    test("clicking the eye button again hides the confirm password", async() => {
        await render(<Signup/>);
        const user = userEvent.setup();
        const passwordInput = screen.getByPlaceholderText("Confirm Password");
        const visibilityIcon = screen.getByTestId('toggle-confirm-password-icon');

        await user.type(passwordInput, "Password123!");
        expect(passwordInput.props.secureTextEntry).toBe(true);

        await fireEvent.press(visibilityIcon);
        expect(passwordInput.props.secureTextEntry).toBe(false);

        await fireEvent.press(visibilityIcon);
        expect(passwordInput.props.secureTextEntry).toBe(true);
    })
})

//navigation test throws an error about expo router linking
/*
describe ("Navigation to the correct screen", () => {

    test('navigate to login page when login in to another account is pressed', async() => {
        await renderRouter({
            "/(auth)/login" : Login,
            "/(auth)/signup" : Signup,
        }, {
            initialUrl : "/(auth)/signup",
        })

        await fireEvent.press(screen.getByText("Log in to a different account"));
        expect(await screen.findByText('LOGIN')).toBeOnTheScreen();
    })

    //navigate to onboarding screen if successful input


    //do not navigate anywhere if wrong input

})*/

describe("Rendering error messages", () => {
    //other error handling messages
})