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

import Login from '../src/app/(auth)/login';
import { render, screen } from '@testing-library/react-native';


describe('The screen renders all the components properly', () => {

    beforeEach(async() => {
        await render (<Login/>);
    })

    afterEach(jest.clearAllMocks);
    
    test('greeting message is rendered on screen',  () => {
        expect(screen.getByText("Welcome back! Glad to see you again!")).toBeTruthy();
    })

    test('email input field is rendered on screen', () => {
        expect(screen.getByPlaceholderText("Email")).toBeTruthy();
    })

    test('password input field is rendered on screen', () => {
        expect(screen.getByPlaceholderText("Password")).toBeTruthy();
    })

    test('login button is rendered on screen', () => {
        expect(screen.getByText("LOGIN")).toBeTruthy();
    })

    test('sign up button is rendered on screen', () => {
        expect(screen.getByText("Sign up")).toBeTruthy();
    })

    test('forgot password is rendered on screen', () => {
        expect(screen.getByText("Forgot Password?")).toBeTruthy();
    })
    
})

/*error: 
FAIL  __test__/login.test.tsx
  ● Test suite failed to run

    [@RNC/AsyncStorage]: NativeModule: AsyncStorage is null.

    To fix this issue try these steps:

      • Uninstall, rebuild and restart the app.

      • Run the packager with `--reset-cache` flag.

      • If you are using CocoaPods on iOS, run `pod install` in the `ios` directory, then rebuild and re-run the app.

      • Make sure your project's `package.json` depends on `@react-native-async-storage/async-storage`, even if you only depend on it indirectly through other dependencies. CLI only autolinks native modules found in your `package.json`.

      • If this happens while testing with Jest, check out how to integrate AsyncStorage here: https://react-native-async-storage.github.io/async-storage/docs/advanced/jest

    If none of these fix the issue, please open an issue on the GitHub repository: https://github.com/react-native-async-storage/async-storage/issues

    > 1 | import AsyncStorage from "@react-native-async-storage/async-storage";
        | ^
      2 | import { createClient } from "@supabase/supabase-js";
      3 |
      4 | const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;

      at Object.<anonymous> (node_modules/@react-native-async-storage/async-storage/src/AsyncStorage.native.ts:23:9)
      at Object.require (node_modules/@react-native-async-storage/async-storage/src/index.ts:1:1)
      at Object.require (src/lib/supabase/client.ts:1:1)
      at Object.require (src/context/authcontext.tsx:1:1)
      at Object.require (C:\Users\ssg20\OneDrive\Documents\Uni\Y3\IT Project\Repository\MPowered-Health\MPowered-Health\src\app\(auth)../../../../../../../../../../login.tsx:15:1)
      at Object.require (__test__/login.test.tsx:1:1*/


describe ('Email Validation', () => {

})

describe ('Login Validation', () => {

})

describe ('password validation', () => {

})

describe('authentication', () => {

})

describe('password visibility', () => {
    
})
//check basic rendering
/*
title, 
email input
password input, 
login button
signup button

check form validation
if email empty
invalid email
invalid password
password empty

check successful login
what functions are called
and user is directed to the right screen

failed login
alert and show pop ups

password visibility 

loading state
activitiy indicator




*/