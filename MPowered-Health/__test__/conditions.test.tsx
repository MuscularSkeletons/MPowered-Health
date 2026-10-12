import StorePainConditions from '../src/app/(auth)/(onboarding)/conditions';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { painConditionsOptions } from "@/constants/profile/profile-options";

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

describe ("objects are rendered on screen", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('objects are rendered on screen correctly', async() => {
        await render (<StorePainConditions/>);
        expect(screen.getByText("YOUR PROFILE")).toBeTruthy();
        expect(screen.getByText("5 of 6")).toBeTruthy();
        expect(screen.getByText("Tell us about the pain you’re experiencing")).toBeTruthy();
        expect(screen.getByText("Select any musculoskeletal or chronic pain conditions that apply.")).toBeTruthy();
        expect(screen.getByRole("button", {name: "Continue"})).toBeTruthy();
        expect(screen.getByText("< Back")).toBeTruthy();
        expect(screen.getByText("Skip")).toBeTruthy();
    })

    test("all conditions options are rendered", async() => {
        await render(<StorePainConditions/>);

        painConditionsOptions.forEach((condition) => {
            expect(screen.getByText(condition)).toBeTruthy();
        });
    })
})


describe('selecting options', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("continue button should be disabled if no condition is selected", async() => {
        await render(<StorePainConditions/>);

        expect(screen.getByRole("button", {name: "Continue"})).toBeDisabled();
    })

    test("continue button should be enabled if a condition is selected", async() => {
        await render(<StorePainConditions/>);

        fireEvent.press(screen.getByText(painConditionsOptions[0]));

        expect(screen.getByRole("button", {name: "Continue"})).toBeEnabled();
    })
    
    test('successfully select an option', async() => {
        await render (<StorePainConditions/>);
        fireEvent.press(screen.getByText(painConditionsOptions[0]));
        fireEvent.press(screen.getByRole("button", {name: "Continue"}));

        //update user selection
        expect(mockUpdateUserDraft).toHaveBeenCalledWith({painConditionsOptions : [painConditionsOptions[0]]});
    })

    test('successfully select multiple options', async() => {
        await render (<StorePainConditions/>);
        fireEvent.press(screen.getByText(painConditionsOptions[0]));
        fireEvent.press(screen.getByText(painConditionsOptions[1]));
        fireEvent.press(screen.getByText(painConditionsOptions[5]));
        fireEvent.press(screen.getByRole("button", {name: "Continue"}));

        //update user selection
        expect(mockUpdateUserDraft).toHaveBeenCalledWith({painConditions: [painConditionsOptions[0], painConditionsOptions[1], painConditionsOptions[5]]});
    })

    test("previously selected option can be deselected", async() => {
        await render(<StorePainConditions/>);
        fireEvent.press(screen.getByText(painConditionsOptions[0]));
        expect(screen.getByRole("button", {name: "Continue"})).toBeEnabled();

        //unselect the option
        fireEvent.press(screen.getByText(painConditionsOptions[0]));

        //continue button should be disabled
        expect(screen.getByRole("button", {name: "Continue"})).toBeDisabled();
    })
})

//todo: navigation
describe("navigation tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("successfully navigate to next page", async() => {
        await render(<StorePainConditions/>);

    })

    test("pressing skip should navigate to next page without any conditions being selected", async() => {
        await render(<StorePainConditions/>);

    })

    test("pressing the back button should navigate to the previous page", async() => {
        await render(<StorePainConditions/>);

    })
})