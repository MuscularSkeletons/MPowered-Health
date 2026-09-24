import StoreBirthSex from '../src/app/(auth)/(onboarding)/birthsex';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { sexOptions } from "@/constants/profile/profile-options";


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

describe ("birthsex options are rendered on screen", () => {
    beforeEach(async() => {
        await render (<StoreBirthSex/>);
    })

    afterEach(jest.clearAllMocks);

    test('options are rendered on screen', () => {
        expect(screen.getByText("Birth Sex")).toBeTruthy();
        expect(screen.getByText(sexOptions[0])).toBeTruthy();
        expect(screen.getByText(sexOptions[1])).toBeTruthy();
        expect(screen.getByText(sexOptions[2])).toBeTruthy();
        expect(screen.getByText(sexOptions[3])).toBeTruthy();
        expect(screen.getByText("Continue")).toBeTruthy();
    })
})

describe("Birthsex selection", () => {

    afterEach(() => {
        jest.clearAllMocks();
    })

    test("birthsex not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");
        await render(<StoreBirthSex/>);

        fireEvent.press(screen.getByText("Continue"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    })
})

//todo: navigation bug

describe("navigation", () => {

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('birth sex selected and navigate to next screen', async() => {
        await render(<StoreBirthSex/>);
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("Female"));
        fireEvent.press(screen.getByText("Continue"));

        expect(Alert.alert).not.toHaveBeenCalled(); 
        //todo: navigate to next page
        expect("").toBeTruthy();
    })
})
