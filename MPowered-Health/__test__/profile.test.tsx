import ManageProfile from "@/app/(tabs)/(settings)/profile";
import { painConditionsOptions } from "@/constants/profile/profile-options";
import { render, screen, fireEvent, userEvent } from "@testing-library/react-native";
import { Modal } from "react-native";

const mockUser = {
    name: "Jane",
    email: "jane12@example.com",
    birthsex: "Female",
    birthyear: "1997",
    formalDiagnosis: true,
    painConditions: ["Arthritis", "Back pain"],
    otherCondition: "Frequent headaches",
}

const mockUpdateUser = jest.fn();

jest.mock("@/context/authcontext", () => ({
    useAuth: () => ({
        user: mockUser,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        deleteUser: jest.fn(),
        updateUserDraft: jest.fn(),
        updateUser: mockUpdateUser,
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

        //user info
        expect(screen.getByText("Jane")).toBeTruthy();
        expect(screen.getByText("Female")).toBeTruthy();
        expect(screen.getByText("1997")).toBeTruthy();  
        expect(screen.getByText("Have formal diagnosis")).toBeTruthy();
        expect(screen.getByText("Frequent headaches")).toBeTruthy();    
        expect(screen.getByText("jane12@example.com")).toBeTruthy();
        expect(screen.getByText("Change password")).toBeTruthy();
    })
})

describe("editing name tests", () => {
    test("pressing on name should open the name editor", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //clicking on name to edit
        await user.press(screen.getByText("Jane"));

        //modal should open
        console.log("open up modal");
        expect(screen.getByText("Edit Name")).toBeTruthy();
        expect(screen.getByText("Name")).toBeTruthy();
        expect(screen.getByText("Jane")).toBeTruthy();
        expect(screen.getByText("Cancel")).toBeTruthy();
        expect(screen.getByText("Save")).toBeTruthy();
        console.log("pop up was opened");
        
    })

    test("name is edited successfully", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //open the modal
        await user.press(screen.getByText("Jane"));
        console.log("modal is open");
        expect(screen.getByText("Edit Name")).toBeTruthy();

        //get the input field and make the edit
        const nameInput = screen.getByTestId("name-input");
        fireEvent.changeText(nameInput, "John");
        console.log("name changed");

        //save the edit
        await user.press(screen.getByText("Save"));

        expect(mockUpdateUser).toHaveBeenCalledWith({name: "John"});
        console.log("user name updated");        
    })

})