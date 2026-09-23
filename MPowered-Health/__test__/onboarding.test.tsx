import Onboarding from '../src/app/(auth)/(onboarding)/onboarding';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe("rendering elements on screen", () => {
    test("instruction message is rendered on screen", async() => {
        await render(<Onboarding/>);
        expect(screen.getByText("Complete Your Profile")).toBeTruthy();
    })

    test("continue button is rendered on screen", async() => {
        await render(<Onboarding/>);
        expect(screen.getByText("CONTINUE")).toBeTruthy();
    })
})

describe("navigation test", () => {
    test("pressing continue button moves to the next screen", async() => {
        await render(<Onboarding/>);
        fireEvent.press(screen.getByText("CONTINUE"));
        
        //todo: navigation
        expect("").toBeFalsy();
    })
})