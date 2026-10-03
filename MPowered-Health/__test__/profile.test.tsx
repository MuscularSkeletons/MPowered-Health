import ManageProfile from "@/app/(tabs)/(settings)/profile";
import { painConditionsOptions } from "@/constants/profile/profile-options";
import { render, screen } from "@testing-library/react-native";

const mockUser = {
    name: "Jane",
    email: "jane12@example.com",
    birthsex: "Female",
    birthyear: "1997",
    formalDiagnosis: true,
    painConditions: ["Arthritis", "Back pain"],
    otherCondition: "Frequent headaches",
}

jest.mock("@/context/authcontext", () => ({
    useAuth: () => ({
        user: mockUser,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        deleteUser: jest.fn(),
        updateUserDraft: jest.fn(),
        updateUser: jest.fn(),
        isLoading: false,
        updateAuthUserEmail: jest.fn(),
        updateAuthUserPassword: jest.fn()
    }),
}))

describe("objects rendered on screen", () => {
    test("objects are rendered on screen correctly", async() => {
        await render(<ManageProfile/>);
        expect(screen.getByText("PROFILE")).toBeTruthy();
        expect(screen.getByText("Edit your profile")).toBeTruthy();
        expect(screen.getByText("Edit your information or update your security details")).toBeTruthy();
        expect(screen.getByText("Jane")).toBeTruthy();
        expect(screen.getByText("Female")).toBeTruthy();
        expect(screen.getByText("1997")).toBeTruthy();  
        expect(screen.getByText("Have formal diagnosis")).toBeTruthy();
        expect(screen.getByText("Frequent headaches")).toBeTruthy();    
        expect(screen.getByText("jane12@example.com")).toBeTruthy();
        expect(screen.getByText("Change password")).toBeTruthy();
    })
})