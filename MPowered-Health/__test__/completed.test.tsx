import CompleteOnboarding from "@/app/(auth)/(onboarding)/completed";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { painConditionsOptions } from "@/constants/profile/profileOptions";
import { Alert } from "react-native";

const mockUser = {
    name: "Jane",
    email: "jane12@example.com",
    birthsex: "Female",
    birthyear: "1997",
    formalDiagnosis: true,
    painConditions: [painConditionsOptions[0], painConditionsOptions[2]],
    otherCondition: "Frequent headaches",
    onboardingComplete: true,
}

const mockUpdateUser = jest.fn();

jest.mock("@/context/authcontext", () => ({
    useAuth: () => ({
        user: mockUser,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        updateUser: mockUpdateUser,
        updateUserDraft: jest.fn(),
        isLoading: false,
    }),
}))

describe("rendering objects", () => {
    test("objects are rendered on screen correctly", async() => {
        await render(<CompleteOnboarding/>);
        
        expect(screen.getByText("PROFILE COMPLETE")).toBeTruthy();
        expect(screen.getByText("Thank you, Jane 😃")).toBeTruthy();
        expect(screen.getByText("Your answers are ready to be linked to your account.")).toBeTruthy();
        expect(screen.getByText("Continue to finish setup and prepare your MPowered Health experience.")).toBeTruthy();
        expect(screen.getByRole("button", {name: "Finish setup"})).toBeTruthy();
    })
})

describe("updating user profile", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("when finish setup is pressed, the user profile is updated", async() => {
        await render(<CompleteOnboarding/>);

        await fireEvent.press(screen.getByRole("button", {name: "Finish setup"}));
        await waitFor(() => {
            expect(mockUpdateUser).toHaveBeenCalledWith({
            name: "Jane",
            birthsex: "Female",
            birthyear: "1997",
            formalDiagnosis: true,
            painConditions: [painConditionsOptions[0], painConditionsOptions[2]],
            otherCondition: "Frequent headaches",
            onboardingComplete: true,
            })
        }) 
    })

    test("show an error if updating the user profile fails", async() => {
        await render(<CompleteOnboarding/>);
        const spyAlert = jest.spyOn(Alert, "alert");

        const profileError = new Error("Failed to update profile");
        mockUpdateUser.mockRejectedValueOnce(profileError);

        await fireEvent.press(screen.getByRole("button", {name: "Finish setup"}));

        await waitFor(() => {
            expect(spyAlert).toHaveBeenCalledWith('Error', 'Failed to complete. Please try again.')
        });
    })
})