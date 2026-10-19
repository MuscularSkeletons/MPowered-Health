import StoreBirthYear from '../src/app/(auth)/(onboarding)/birthyear';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { BIRTH_YEAR_RANGE } from "@/constants/profile/profileConstants";

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
        updateUserDraft : mockUpdateUserDraft,
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

describe ("objects are rendered on screen", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('options are rendered on screen', async() => {
        await render (<StoreBirthYear/>);
        expect(screen.getByText("YOUR PROFILE")).toBeTruthy();
        expect(screen.getByText("3 of 6")).toBeTruthy();
        expect(screen.getByText("Your year of birth")).toBeTruthy();
        expect(screen.getByText("Research shows that people can feel pain differently depending on their age. This question is optional.")).toBeTruthy();
        expect(screen.getByText("Year of birth")).toBeTruthy();
        expect(screen.getByPlaceholderText("YYYY")).toBeTruthy();
        expect(screen.getByRole("button", {name: "Continue"})).toBeTruthy();
        expect(screen.getByText("Skip")).toBeTruthy();
        expect(screen.getByText("‹ Back")).toBeTruthy();
    })
})

describe("input fields for year", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("user can enter a year", async() => {
        await render(<StoreBirthYear/>);
        const yearInput = screen.getByPlaceholderText("YYYY");
        const user = userEvent.setup();
        await user.type(yearInput, "1997");

        expect(yearInput.props.value).toBe("1997");
    })
})

describe("input validation", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("continue button is disabled if no year is entered", async() => {
        await render(<StoreBirthYear/>);

        expect(screen.getByRole("button", {name: "Continue"})).toBeDisabled();
    })

    test("continue button is disabled if year shorter than 4 characters is entered", async() => {
        await render(<StoreBirthYear/>);
        const yearInput = screen.getByPlaceholderText("YYYY");
        const user = userEvent.setup();
        await user.type(yearInput, "199");

        expect(screen.getByRole("button", {name: "Continue"})).toBeDisabled();
    })

    test("if trying to enter a year longer than 4 characters, only allow the first 4 characters", async() => {
        await render(<StoreBirthYear/>);
        const yearInput = screen.getByPlaceholderText("YYYY");
        const user = userEvent.setup();
        await user.type(yearInput, "19978");

        expect(yearInput.props.value).toBe("1997");
    })

    test("throw an error if entered year is below the allowed range", async() => {
        await render(<StoreBirthYear/>);
        jest.spyOn(Alert, "alert");
        const yearInput = screen.getByPlaceholderText("YYYY");
        const user = userEvent.setup();
        await user.type(yearInput, String(BIRTH_YEAR_RANGE.LOWER_BOUND - 1));

        fireEvent.press(screen.getByRole("button", {name: "Continue"}));
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid four-digit year');     
    })

    test("throw an error if entered year is above the allowed range", async() => {
        await render(<StoreBirthYear/>);
        jest.spyOn(Alert, "alert");
        const yearInput = screen.getByPlaceholderText("YYYY");
        const user = userEvent.setup();
        await user.type(yearInput, String(BIRTH_YEAR_RANGE.UPPER_BOUND + 1));

        fireEvent.press(screen.getByRole("button", {name: "Continue"}));
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid four-digit year');     
    })

    test("user enters a valid year and can press continue", async() => {
        await render(<StoreBirthYear/>);
        jest.spyOn(Alert, "alert");
        const yearInput = screen.getByPlaceholderText("YYYY");
        const user = userEvent.setup();
        const year = 1997;
        await user.type(yearInput, String(year));

        expect(screen.getByRole("button", {name: "Continue"})).toBeEnabled();
        fireEvent.press(screen.getByRole("button", {name: "Continue"}));
        expect(Alert.alert).not.toHaveBeenCalled();
        expect(mockUpdateUserDraft).toHaveBeenCalledWith({birthyear: year});
    })

})

describe("navigation", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('birth year selected and navigate to next screen', async() => {
        await render(<StoreBirthYear/>);
        jest.spyOn(Alert, "alert");
        const yearInput = screen.getByPlaceholderText("YYYY");
        const user = userEvent.setup();
        await user.type(yearInput, "1997");

        fireEvent.press(screen.getByRole("button", {name: "Continue"}));
        expect(Alert.alert).not.toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/(auth)/(onboarding)/diagnosis");
    })

    test('user skips the question', async() => {
        await render(<StoreBirthYear/>);
        fireEvent.press(screen.getByText("Skip"));
        expect(mockPush).toHaveBeenCalledWith("/(auth)/(onboarding)/diagnosis");
    })

    test('user presses the back button', async() => {
        await render(<StoreBirthYear/>);
        fireEvent.press(screen.getByText("‹ Back"));
        expect(mockBack).toHaveBeenCalled();
    })
})

//todo: user not authenticated test case
