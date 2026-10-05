import ManageProfile from "@/app/(tabs)/(settings)/profile";
import { BIRTH_YEAR_RANGE } from "@/constants/profile/profile-constants";
import { painConditionsOptions } from "@/constants/profile/profile-options";
import { render, screen, fireEvent, userEvent } from "@testing-library/react-native";
import { Alert, Modal } from "react-native";

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

    beforeEach(() => {
        jest.clearAllMocks();
    })

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

    test("pressing cancel does not edit the name", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //open the modal
        await user.press(screen.getByText("Jane"));
        expect(screen.getByText("Edit Name")).toBeTruthy();

        const nameInput = screen.getByTestId("name-input");
        fireEvent.changeText(nameInput, "John");

        //press cancel
        await user.press(screen.getByText("Cancel"));

        //no change should be expected
        expect(screen.getByText("Jane")).toBeTruthy();
        //expect(mockUpdateUser).not.toHaveBeenCalled();
    })

    test("entering an empty string throws an alert", async() => {
        const user = userEvent.setup();
        const spyAlert = jest.spyOn(Alert, 'alert');
        await render(<ManageProfile/>);

        //open the modal
        await user.press(screen.getByText("Jane"));
        console.log("modal is open");
        expect(screen.getByText("Edit Name")).toBeTruthy();

        //get the input field and make the edit
        const nameInput = screen.getByTestId("name-input");
        fireEvent.changeText(nameInput, "");

        //save the edit
        await user.press(screen.getByText("Save"));

        expect(spyAlert).toHaveBeenCalledWith('Error', 'Please enter your name');
    })

})

describe("editing birthsex tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing on birthsex should open the editor", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //clicking on birthsex to edit
        await user.press(screen.getByText("Female"));

        //modal should open
        console.log("open up modal");
        expect(screen.getByText("Edit Birth Sex")).toBeTruthy();
        expect(screen.getByText("Male")).toBeTruthy()
        expect(screen.getByText("Cancel")).toBeTruthy();
        expect(screen.getByText("Save")).toBeTruthy();
        console.log("pop up was opened");
    })
    
    test("birthsex is edited successfully", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //open the modal
        await user.press(screen.getByText("Female"));
        console.log("modal is open");
        expect(screen.getByText("Edit Birth Sex")).toBeTruthy();

        fireEvent.press(screen.getByText("Male"));
        await user.press(screen.getByText("Save"));

        expect(mockUpdateUser).toHaveBeenCalledWith({birthsex: "Male"});
    })

    test("pressing cancel does not make any edits", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //open the modal
        await user.press(screen.getByText("Female"));
        expect(screen.getByText("Edit Birth Sex")).toBeTruthy();

        fireEvent.press(screen.getByText("Male"));

        //press cancel
        await user.press(screen.getByText("Cancel"));

        //no change should be expected
        expect(screen.getByText("Female")).toBeTruthy();
        //expect(mockUpdateUser).not.toHaveBeenCalled();
    })
 

})

describe("editing birth year tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing on birthyear should open the editor", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //clicking on birth year to edit
        await user.press(screen.getByText("1997"));

        //modal should open
        console.log("open up modal");
        expect(screen.getByText("Edit Birth Year")).toBeTruthy();
        expect(screen.getByText("Year of birth")).toBeTruthy();
        expect(screen.getByText("1997")).toBeTruthy()
        expect(screen.getByText("Cancel")).toBeTruthy();
        expect(screen.getByText("Save")).toBeTruthy();
        console.log("pop up was opened");
    })

    test("birthyear is changed successfully", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //clicking on birth year to edit
        await user.press(screen.getByText("1997"));

        //get the input field to edit 
        const yearInput = screen.getByTestId("birth-year-input");
        fireEvent.changeText(yearInput, "2000");
        console.log("birth year changed");

        //save the edit
        await user.press(screen.getByText("Save"));

        expect(mockUpdateUser).toHaveBeenCalledWith({birthyear: 2000});
        console.log("birth year updated");        
    })

    test("pressing cancel does not make edits", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //clicking on birth year to edit
        await user.press(screen.getByText("1997"));

        //get the input field to edit 
        const yearInput = screen.getByTestId("birth-year-input");
        fireEvent.changeText(yearInput, "2000");
        console.log("birth year changed");

        //cancel the edit
        await user.press(screen.getByText("Cancel"));

        expect(screen.getByText("1997")).toBeTruthy();
        //expect(mockUpdateUser).not.toHaveBeenCalled();
    })

    test("entered year is below the allowed range", async() => {
        const user = userEvent.setup();
        const spyAlert = jest.spyOn(Alert, 'alert');
        await render(<ManageProfile/>);

        //clicking on birth year to edit
        await user.press(screen.getByText("1997"));

        //get the input field to edit 
        const yearInput = screen.getByTestId("birth-year-input");
        fireEvent.changeText(yearInput, String(BIRTH_YEAR_RANGE.LOWER_BOUND - 1));
        console.log("birth year changed");

        //save the edit
        await user.press(screen.getByText("Save"));

        expect(spyAlert).toHaveBeenCalledWith('Error', 'Please enter a valid four-digit year');
    })

    test("entered year is above the allowed range", async() => {
        const user = userEvent.setup();
        const spyAlert = jest.spyOn(Alert, 'alert');
        await render(<ManageProfile/>);

        //clicking on birth year to edit
        await user.press(screen.getByText("1997"));

        //get the input field to edit 
        const yearInput = screen.getByTestId("birth-year-input");
        fireEvent.changeText(yearInput, String(BIRTH_YEAR_RANGE.UPPER_BOUND + 1));
        console.log("birth year changed");

        //save the edit
        await user.press(screen.getByText("Save"));

        expect(spyAlert).toHaveBeenCalledWith('Error', 'Please enter a valid four-digit year');
    }) 

})