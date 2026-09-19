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

import SplashScreen from '../src/app/(auth)/splashscreen';
import Login from '../src/app/(auth)/login';
import Signup from '../src/app/(auth)/signup';
import { fireEvent, render, screen } from '@testing-library/react-native';
import {renderRouter} from 'expo-router/testing-library';

//check if screen components render properly
describe('splash screen components render properly', () => {

    beforeEach(async() => {
    //wait until the screen is fully rendered
        await render(<SplashScreen/>);
    })

    test('rendering get started button', () => {
        expect(screen.getByText("Get Started")).toBeTruthy();
    });

    test('rendering sign in button', () => {
        expect(screen.getByText("Sign in")).toBeTruthy();
    });
    
     //todo:add slideshow render test
    /*
    test('rendering app info slide show', async() => {

        //maybe use fireEvent() and mocks

    })*/

});

describe ("Navigation to the correct screen", () => {
    test('navigate to signup page when get started button is pressed', async() => {

        await renderRouter( {
            "/(auth)/signup" : Signup,
            "/(auth)/splashscreen": SplashScreen,
        }, {
            initialUrl: "/(auth)/splashscreen",
        });
        
        await fireEvent.press(screen.getByText("Get Started"));
        expect(await screen.findByText('SIGN UP')).toBeOnTheScreen();
    })

    test('navigate to login page when sign in button is pressed', async() => {

        await renderRouter( {
            "/(auth)/login" : Login,
            "/(auth)/splashscreen": SplashScreen,
        }, {
            initialUrl: "/(auth)/splashscreen",
        });
        
        await fireEvent.press(screen.getByText("Sign in"));
        expect(await screen.findByText('LOGIN')).toBeOnTheScreen();

    })
})