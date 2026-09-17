import Signup from '../src/app/(auth)/signup';
import { render, screen } from '@testing-library/react-native';

describe ('Sign up rendering', () => {

    beforeEach(() => {
        render (<Signup/>);
    })

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

    //render password mismatch message

})