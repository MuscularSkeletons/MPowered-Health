import StoreBirthSex from '@/app/(auth)/(onboarding)/birthsex';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { sexOptions } from "@/constants/profile/profileOptions";

const mockUser = jest.fn(() => Promise.resolve('mocked user'));
const mockUpdateUserDraft = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();

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

//mocking expo router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        back: mockBack,
    })
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

        await waitFor (() => {
            expect(screen.getByRole("button", {name: "Continue"})).toBeEnabled();
        })
    })

    test("successfully select an option", async() => {
        await render(<StoreBirthSex/>);

        fireEvent.press(screen.getByText(sexOptions[0]));

        await waitFor (() => {
            expect(screen.getByRole("button", {name: "Continue"})).toBeEnabled();
        })
        
        fireEvent.press(screen.getByRole("button", {name: "Continue"}));
        expect(mockUpdateUserDraft).toHaveBeenCalledWith({birthsex: sexOptions[0]});
    })
})

describe("navigation", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('birth sex selected and navigate to next screen', async() => {
        await render(<StoreBirthSex/>);

        fireEvent.press(screen.getByText(sexOptions[0]));

        await waitFor (() => {
            expect(screen.getByRole("button", {name: "Continue"})).toBeEnabled();
        })
        
        fireEvent.press(screen.getByRole("button", {name: "Continue"}));
        expect(mockUpdateUserDraft).toHaveBeenCalledWith({birthsex: sexOptions[0]});
        expect(mockPush).toHaveBeenCalledWith('/(auth)/(onboarding)/birthyear');
    })

    test("navigate to previous page when back button is pressed", async() => {
        await render(<StoreBirthSex/>);

        fireEvent.press(screen.getByText("‹ Back"));

        expect(mockBack).toHaveBeenCalled();
    })
})
