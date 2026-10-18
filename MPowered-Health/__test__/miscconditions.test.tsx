import StoreOtherConditions from "@/app/(auth)/(onboarding)/miscconditions";
import { fireEvent, render, screen, userEvent } from "@testing-library/react-native";

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

describe("rendering objects", () => {
    test("objects are rendered on screen properly", async() => {
        await render(<StoreOtherConditions/>);
        expect(screen.getByText("YOUR PROFILE")).toBeTruthy();
        expect(screen.getByText("6 of 6")).toBeTruthy();
        expect(screen.getByText("Do you have any other conditions?")).toBeTruthy();
        expect(screen.getByText("Add any other conditions or symptoms you know about. This question is optional.")).toBeTruthy();
        expect(screen.getByText("Other conditions")).toBeTruthy();
        expect(screen.getByPlaceholderText("Type conditions or symptoms")).toBeTruthy();      
        expect(screen.getByRole("button", {name: "Continue"})).toBeTruthy();
        expect(screen.getByText("Skip")).toBeTruthy();
        expect(screen.getByText("‹ Back")).toBeTruthy();
    })
})

describe("input functionality", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    })


    test("continue button is disabled if no text is entered", async() => {
        await render(<StoreOtherConditions/>);

        expect(screen.getByRole("button", {name: "Continue"})).toBeDisabled();
    })

    test("continue button is enabled if text is entered", async() => {
        await render(<StoreOtherConditions/>);
        const user = userEvent.setup();
        const conditionInput = screen.getByPlaceholderText("Type conditions or symptoms");

        await user.type(conditionInput, "Migraines");
        expect(screen.getByRole("button", {name: "Continue"})).toBeEnabled();
    })  

    test("entering whitespace does not enable the continue button", async() => {
        await render(<StoreOtherConditions/>);
        const user = userEvent.setup();
        const conditionInput = screen.getByPlaceholderText("Type conditions or symptoms");

        await user.type(conditionInput, " ");
        expect(screen.getByRole("button", {name: "Continue"})).toBeDisabled();       
    })

    test("successfully enter a condition" , async() => {
        await render(<StoreOtherConditions/>);
        const user = userEvent.setup();
        const conditionInput = screen.getByPlaceholderText("Type conditions or symptoms");
        const condition = "Migranies";

        await user.type(conditionInput, condition);
        fireEvent.press(screen.getByRole("button", {name: "Continue"}));

        //update user input
        expect(mockUpdateUserDraft).toHaveBeenCalledWith({otherCondition:condition});
    })

})

//todo: navigation
describe("navigation tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing continue will navigate to next page", async() => {
        await render(<StoreOtherConditions/>);

        const user = userEvent.setup();
        const conditionInput = screen.getByPlaceholderText("Type conditions or symptoms");
        const condition = "Migranies";

        await user.type(conditionInput, condition);
        fireEvent.press(screen.getByRole("button", {name: "Continue"}));

        //update user input
        expect(mockUpdateUserDraft).toHaveBeenCalledWith({otherCondition:condition});        
        expect(mockPush).toHaveBeenCalledWith('/(auth)/(onboarding)/completed');
    })

    test("pressing skip will navigate to the next screen", async() => {
        await render(<StoreOtherConditions/>);
        fireEvent.press(screen.getByText("Skip"));
        expect(mockPush).toHaveBeenCalledWith('/(auth)/(onboarding)/completed');
    })

    test("pressing back will navigate to the previous page", async() => {
        await render(<StoreOtherConditions/>);
        fireEvent.press(screen.getByText("‹ Back"));
        expect(mockBack).toHaveBeenCalled();
    })
})