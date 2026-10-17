import Onboarding from '../src/app/(auth)/(onboarding)/onboarding';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { openBrowserAsync } from 'expo-web-browser';
import { Alert } from 'react-native';

//mocking the web browser
jest.mock('expo-web-browser', () => ({
    openBrowserAsync: jest.fn()
}))

describe("rendering objects", () => {
    test("objects are rendered on screen correctly", async() => {
        await render(<Onboarding/>);
        expect(screen.getByText("GET STARTED")).toBeTruthy();
        expect(screen.getByText("Hello 👋🏻")).toBeTruthy();
        expect(screen.getByText("A few quick questions so we can make MPowered Health more relevant for you.")).toBeTruthy();
        expect(screen.getByText("By continuing, you agree to MPowered’s Terms and Conditions and Privacy Policy")).toBeTruthy();
        expect(screen.getByRole("button", {name:"Continue"})).toBeTruthy();
    })
})

describe("url link tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("clicking on privacy policy opens the correct link", async() => {
        await render(<Onboarding/>);
        fireEvent.press(screen.getByRole('link', {name : "Privacy Policy"}));
        await expect(openBrowserAsync).toHaveBeenCalledWith('https://muscha.org/privacy-policy/');
    })

    test("clicking on T&Cs opens the correct link", async() => {
        await render(<Onboarding/>);
        fireEvent.press(screen.getByRole('link', {name : "Terms and Conditions"}));
        await expect(openBrowserAsync).toHaveBeenCalledWith('https://muscha.org/terms-and-conditions/');
    })

    test("throw error if unable to open privacy policy link", async() => {
        await render(<Onboarding/>);

        const browserError = new Error('Failed to open web browser');
        (openBrowserAsync as jest.Mock).mockRejectedValueOnce(browserError);

        const spyAlert = jest.spyOn(Alert, 'alert');
        fireEvent.press(screen.getByRole('link', {name : "Privacy Policy"}));
        await waitFor(() => expect(spyAlert).toHaveBeenCalledWith('Unable to open page', 'Please try again.'))
    })

    test("throw error if unable to open t&cs link", async() => {
        await render(<Onboarding/>);

        const browserError = new Error('Failed to open web browser');
        (openBrowserAsync as jest.Mock).mockRejectedValueOnce(browserError);

        const spyAlert = jest.spyOn(Alert, 'alert');
        fireEvent.press(screen.getByRole('link', {name : "Terms and Conditions"}));
        await waitFor(() => expect(spyAlert).toHaveBeenCalledWith('Unable to open page', 'Please try again.'))
    })
})

//todo: navigation tests
describe("navigation test", () => {
    test("pressing continue button moves to the next screen", async() => {
        await render(<Onboarding/>);
        fireEvent.press(screen.getByRole("button", {name:"Continue"}));
        
        //todo: navigate to name screen
    })
})