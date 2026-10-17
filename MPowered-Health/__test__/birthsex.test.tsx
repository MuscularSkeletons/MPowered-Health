import StoreBirthSex from '../src/app/(auth)/(onboarding)/birthsex';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { sexOptions } from "@/constants/profile/profile-options";

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

describe ("birthsex options are rendered on screen", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('options are rendered on screen', async() => {
        await render (<StoreBirthSex/>);
        expect(screen.getByText("YOUR PROFILE")).toBeTruthy();
        expect(screen.getByText("2 of 6")).toBeTruthy();
        expect(screen.getByText("Your sex")).toBeTruthy();
        expect(screen.getByText("Research shows that people may experience pain differently depending on their sex.")).toBeTruthy();
        expect(screen.getByText(sexOptions[0])).toBeTruthy();
        expect(screen.getByText(sexOptions[1])).toBeTruthy();
        expect(screen.getByText(sexOptions[2])).toBeTruthy();
        expect(screen.getByText(sexOptions[3])).toBeTruthy();
        expect(screen.getByRole("button", {name: "Continue"})).toBeTruthy();
        expect(screen.getByText("‹ Back")).toBeTruthy();
    })
})

describe("Birthsex selection", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("continue button is disabled if an option is not selected", async() => {
        await render(<StoreBirthSex/>);
        
        expect(screen.getByRole("button", {name: "Continue"})).toBeDisabled();
    })

    test("continue button is enabled if an option is selected", async() => {
        await render(<StoreBirthSex/>);

        fireEvent.press(screen.getByText(sexOptions[0]));

        expect(screen.getByRole("button", {name: "Continue"})).toBeEnabled();
    })

    test("successfully select an option", async() => {
        await render(<StoreBirthSex/>);

        fireEvent.press(screen.getByText(sexOptions[0]));

        expect(screen.getByRole("button", {name: "Continue"})).toBeEnabled();
        
        fireEvent.press(screen.getByRole("button", {name: "Continue"}));
        expect(mockUpdateUserDraft).toHaveBeenCalledWith({birthsex: sexOptions[0]});
    })
})

//todo: navigation bug

describe("navigation", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('birth sex selected and navigate to next screen', async() => {
        await render(<StoreBirthSex/>);

        fireEvent.press(screen.getByText(sexOptions[0]));

        expect(screen.getByRole("button", {name: "Continue"})).toBeEnabled();
        
        fireEvent.press(screen.getByRole("button", {name: "Continue"}));
        expect(mockUpdateUserDraft).toHaveBeenCalledWith({birthsex: sexOptions[0]});

        //todo: navigate to next page
        expect("").toBeTruthy();
    })

    test("navigate to previous page when back button is pressed", async() => {
        await render(<StoreBirthSex/>);

        fireEvent.press(screen.getByText("< Back"));

        //todo: navigate to name page
        expect("").toBeTruthy();
    })
})
