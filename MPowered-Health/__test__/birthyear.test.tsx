import StoreBirthYear from '../src/app/(auth)/(onboarding)/birthyear';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { BIRTH_YEAR_RANGE } from "@/constants/profile/profile-constants";


const mockUser = jest.fn(() => Promise.resolve('mocked user'));

jest.mock("@/context/authcontext", () => ({
    useAuth: () => ({
        user: mockUser,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
        isLoading: false,
    }),
}))

describe ("objects are rendered on screen", () => {
    beforeEach(async() => {
        await render (<StoreBirthYear/>);
    })

    afterEach(jest.clearAllMocks);

    test('options are rendered on screen', () => {
        expect(screen.getByText("Birth Year")).toBeTruthy();
        expect(screen.getByPlaceholderText("YYYY")).toBeTruthy();
        expect(screen.getByText("SUBMIT")).toBeTruthy();
        expect(screen.getByText("SKIP")).toBeTruthy();
    })
})

describe("input fields for year", () => {

    afterEach(() => {
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

    afterEach(() => {
        jest.clearAllMocks();
    })

    test("no year is entered", async() => {
        jest.spyOn(Alert, "alert");
        await render(<StoreBirthYear/>);

        fireEvent.press(screen.getByText("SUBMIT"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "no input detected");
    })

    test("year shorter than 4 characters is entered", async() => {
        await render(<StoreBirthYear/>);
        jest.spyOn(Alert, "alert");
        const yearInput = screen.getByPlaceholderText("YYYY");
        const user = userEvent.setup();
        await user.type(yearInput, "199");

        fireEvent.press(screen.getByText("SUBMIT"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "invalid year entered");
    })

    test("year longer than 4 characters is entered", async() => {
        await render(<StoreBirthYear/>);
        jest.spyOn(Alert, "alert");
        const yearInput = screen.getByPlaceholderText("YYYY");
        const user = userEvent.setup();
        await user.type(yearInput, "19978");

        fireEvent.press(screen.getByText("SUBMIT"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "invalid year entered");
    })

    test("entered year is below the allowed range", async() => {
        await render(<StoreBirthYear/>);
        jest.spyOn(Alert, "alert");
        const yearInput = screen.getByPlaceholderText("YYYY");
        const user = userEvent.setup();
        await user.type(yearInput, String(BIRTH_YEAR_RANGE.LOWER_BOUND - 1));

        fireEvent.press(screen.getByText("SUBMIT"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please enter a valid years");     
    })

    test("entered year is above the allowed range", async() => {
        await render(<StoreBirthYear/>);
        jest.spyOn(Alert, "alert");
        const yearInput = screen.getByPlaceholderText("YYYY");
        const user = userEvent.setup();
        await user.type(yearInput, String(BIRTH_YEAR_RANGE.UPPER_BOUND + 1));

        fireEvent.press(screen.getByText("SUBMIT"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please enter a valid years");     
    })

    test("user enters a valid year", async() => {
        await render(<StoreBirthYear/>);
        jest.spyOn(Alert, "alert");
        const yearInput = screen.getByPlaceholderText("YYYY");
        const user = userEvent.setup();
        await user.type(yearInput, "1997");

        fireEvent.press(screen.getByText("SUBMIT"));
        expect(Alert.alert).not.toHaveBeenCalled();
    })

})

describe("navigation", () => {

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('birth sex selected and navigate to next screen', async() => {
        await render(<StoreBirthYear/>);
        jest.spyOn(Alert, "alert");
        const yearInput = screen.getByPlaceholderText("YYYY");
        const user = userEvent.setup();
        await user.type(yearInput, "1997");

        fireEvent.press(screen.getByText("SUBMIT"));
        expect(Alert.alert).not.toHaveBeenCalled();
        //todo: navigate to next page
    })

    test('user skips the question', async() => {
        await render(<StoreBirthYear/>);
        fireEvent.press(screen.getByText("SKIP"));
        expect("").toBeTruthy();
    })

    test('user presses the back button', () => {
        expect("").toBeTruthy();
    })
})

//todo: user not authenticated test case
