import StoreDiagnosis from '../src/app/(auth)/(onboarding)/diagnosis';
import { fireEvent, render, screen } from '@testing-library/react-native';

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

describe("objects are rendered on screen", () => {

    test('options are rendered on screen correctly', async() => {
        await render(<StoreDiagnosis/>);
        expect(screen.getByText("YOUR PROFILE")).toBeTruthy();
        expect(screen.getByText("4 of 6")).toBeTruthy();
        expect(screen.getByText("Do you have a musculoskeletal or chronic pain diagnosis from your doctor?")).toBeTruthy();
        expect(screen.getByText("For example, arthritis, back pain, or gout. No diagnosis? No problem—you know your body and how you feel.")).toBeTruthy();
        expect(screen.getByText("Yes, I have")).toBeTruthy();
        expect(screen.getByText("No, I haven’t")).toBeTruthy();      
        expect(screen.getByRole("button", {name: "Continue"})).toBeTruthy();
        expect(screen.getByText("< Back")).toBeTruthy();
    })  
})

describe("selecting diagnosis options", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('continue button is disabled if no option is selected', async() => {
        await render(<StoreDiagnosis/>);
        expect(screen.getByRole("button", {name: "Continue"})).toBeDisabled();
    })

    test('continue button is enabled if an option is selected', async() => {
        await render(<StoreDiagnosis/>);

        fireEvent.press(screen.getByText("Yes, I have"));
        expect(screen.getByRole("button", {name: "Continue"})).toBeEnabled();
    })

    test("successfully select an option", async() => {
        await render(<StoreDiagnosis/>);

        fireEvent.press(screen.getByText("Yes, I have"));
        fireEvent.press(screen.getByRole("button", {name: "Continue"}));

        //update user selection
        expect(mockUpdateUserDraft).toHaveBeenCalledWith({formalDiagnosis: true});
    })
    
})

//todo: navigation tests
describe("navigation tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing continue will navigate to next page", async() => {
        await render(<StoreDiagnosis/>);

    })

    test("pressing back will navigate to the previous page", async() => {
        await render(<StoreDiagnosis/>);
        
    })
})