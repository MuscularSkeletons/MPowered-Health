import ManageProfile from "@/app/(tabs)/(settings)/profile";
import { BIRTH_YEAR_RANGE } from "@/constants/profile/profile-constants";
import { diagnosisOptions, painConditionsOptions } from "@/constants/profile/profile-options";
import { render, screen, fireEvent, userEvent, waitFor } from "@testing-library/react-native";
import { Alert, Modal } from "react-native";

const mockUser = {
    name: "Jane",
    email: "jane12@example.com",
    birthsex: "Female",
    birthyear: "1997",
    formalDiagnosis: true,
    painConditions: [painConditionsOptions[0], painConditionsOptions[2]],
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

    beforeEach(() => {
        jest.clearAllMocks();
    })

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
        expect(screen.getByText("Edit Conditions")).toBeTruthy();
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

describe("editing conditions tests (scrollable list)", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing on conditions should open the editor", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //clicking on conditions to edit
        await user.press(screen.getByText("Edit Conditions"));

        //modal should open
        expect(screen.getAllByText("Edit Conditions")).toBeTruthy();
        expect(screen.getByText(painConditionsOptions[0])).toBeTruthy();
        expect(screen.getByText(painConditionsOptions[1])).toBeTruthy();
        expect(screen.getByText("Cancel"));
        expect(screen.getByText("Save"));
    })

    test("adding a condition to the list successfully", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        await user.press(screen.getByText("Edit Conditions"));

        //modal should open
        expect(screen.getAllByText("Edit Conditions")).toBeTruthy();

        await user.press(screen.getByText(painConditionsOptions[5]));
        await user.press(screen.getByText(painConditionsOptions[10]));
        console.log("adding", painConditionsOptions[5], "to conditions list");
        console.log("adding", painConditionsOptions[10], "to conditions list");
        
        await user.press(screen.getByText("Save"));

        expect(mockUpdateUser).toHaveBeenCalledWith({painConditions:[painConditionsOptions[0], painConditionsOptions[2], painConditionsOptions[5], painConditionsOptions[10]]});
    })

    test("removing a condition from the list successfully", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        await user.press(screen.getByText("Edit Conditions"));

        //modal should open
        expect(screen.getAllByText("Edit Conditions")).toBeTruthy();

        await user.press(screen.getByText(painConditionsOptions[0]));
        console.log("removing", painConditionsOptions[0], "from conditions list");
        
        await user.press(screen.getByText("Save"));

        expect(mockUpdateUser).toHaveBeenCalledWith({painConditions:[painConditionsOptions[2]]});
    })

    test("allow deselection of all previously selected conditions", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        await user.press(screen.getByText("Edit Conditions"));

        //modal should open
        expect(screen.getAllByText("Edit Conditions")).toBeTruthy();

        await user.press(screen.getByText(painConditionsOptions[0]));
        await user.press(screen.getByText(painConditionsOptions[2]));
        console.log("removing", painConditionsOptions[0], "from conditions list");
        console.log("removing", painConditionsOptions[2], "from conditions list");
        
        await user.press(screen.getByText("Save"));

        expect(mockUpdateUser).toHaveBeenCalledWith({painConditions:[]});
    })

    test("pressing cancel does not make the edits", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        await user.press(screen.getByText("Edit Conditions"));

        //modal should open
        expect(screen.getAllByText("Edit Conditions")).toBeTruthy();

        await user.press(screen.getByText(painConditionsOptions[1]));
        await user.press(screen.getByText(painConditionsOptions[3]));
       
        await user.press(screen.getByText("Cancel"));

        expect(screen.getByText("Edit Conditions")).toBeTruthy();
    })
})

describe("editing diagnosis tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing on diagnosis should open the editor", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //clicking on diagnosis to edit
        await user.press(screen.getByText("Have formal diagnosis"));

        //modal should open
        console.log("open up modal");
        expect(screen.getByText("Edit Diagnosis")).toBeTruthy();
        expect(screen.getByText(diagnosisOptions[0])).toBeTruthy();
        expect(screen.getByText(diagnosisOptions[1])).toBeTruthy()
        expect(screen.getByText("Cancel")).toBeTruthy();
        expect(screen.getByText("Save")).toBeTruthy();
        console.log("pop up was opened");

    })

    test("diagnosis is changed successfully", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //clicking on diagnosis to edit
        await user.press(screen.getByText("Have formal diagnosis"));

        //modal should open
        console.log("open up modal");
        expect(screen.getByText("Edit Diagnosis")).toBeTruthy();
        await fireEvent.press(screen.getByText(diagnosisOptions[1]));

        //save the edit
        await user.press(screen.getByText("Save"));

        expect(mockUpdateUser).toHaveBeenCalledWith({formalDiagnosis: false});

    })

    test("pressing cancel does not make edits", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);
        //clicking on diagnosis to edit
        await user.press(screen.getByText("Have formal diagnosis"));

        //modal should open
        console.log("open up modal");
        expect(screen.getByText("Edit Diagnosis")).toBeTruthy();
        await fireEvent.press(screen.getByText(diagnosisOptions[1]));

        //save the edit
        await user.press(screen.getByText("Cancel"));

        expect(screen.getByText("Have formal diagnosis"));
        //expect(mockUpdateUser).toHaveBeenCalledWith({formaldiagnosis: false});

    })
})

describe("editing other conditions tests (text input)", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing on other conditions should open the editor", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //clicking on other conditions to edit
        await user.press(screen.getByText("Frequent headaches"));

        //modal should open
        console.log("open up modal");
        expect(screen.getByText("Edit Other Conditions")).toBeTruthy();
        expect(screen.getByText("Other conditions")).toBeTruthy();
        expect(screen.getByText("Frequent headaches")).toBeTruthy();
        expect(screen.getByText("Cancel")).toBeTruthy();
        expect(screen.getByText("Save")).toBeTruthy();
        console.log("pop up was opened");
    })

    test("other conditions is changed successfully", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //open the modal
        await user.press(screen.getByText("Frequent headaches"));
        expect(screen.getByText("Edit Other Conditions")).toBeTruthy();

        //get the input field and make the edit
        const conditionsInput = screen.getByTestId("other-conditions-input");
        fireEvent.changeText(conditionsInput, "Pain");

        //save the edit
        await user.press(screen.getByText("Save"));

        expect(mockUpdateUser).toHaveBeenCalledWith({otherCondition: "Pain"}); 
    })

    test("pressing cancel does not edit the condition", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //open the modal
        await user.press(screen.getByText("Frequent headaches"));
        expect(screen.getByText("Edit Other Conditions")).toBeTruthy();

        //get the input field and make the edit
        const conditionsInput = screen.getByTestId("other-conditions-input");
        fireEvent.changeText(conditionsInput, "Pain");

        //save the edit
        await user.press(screen.getByText("Cancel"));

        expect(screen.getByText("Frequent headaches")).toBeTruthy();   
    })

    test("entering an empty string for a condition removes the previously saved condition", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //open the modal
        await user.press(screen.getByText("Frequent headaches"));
        expect(screen.getByText("Edit Other Conditions")).toBeTruthy();

        //get the input field and make the edit
        const conditionsInput = screen.getByTestId("other-conditions-input");
        fireEvent.changeText(conditionsInput, "");

        //save the edit
        await user.press(screen.getByText("Save"));

        expect(mockUpdateUser).toHaveBeenCalledWith({otherCondition : null});    
    })
})

describe("editing email tests (rendering)", () => {
    test("pressing on email opens up the editor", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //clicking on email to edit
        await user.press(screen.getByText("jane12@example.com"));

        //modal should open
        console.log("open up modal");
        expect(screen.getByText("Edit Email")).toBeTruthy();
        expect(screen.getByText("Email address")).toBeTruthy();
        expect(screen.getByText("jane12@example.com")).toBeTruthy();
        expect(screen.getByText("Cancel")).toBeTruthy();
        expect(screen.getByText("Save")).toBeTruthy();
    })

    //email editing functionality will be tested manually
})

describe("editing password tests (rendering)" , () => {
    test("pressing on change password opens up the editor", async() => {
        const user = userEvent.setup();
        await render(<ManageProfile/>);

        //clicking on password to edit
        await user.press(screen.getByText("Change password"));

        //modal should open
        console.log("open up modal");
        expect(screen.getByText("Update your password")).toBeTruthy();
        expect(screen.getByText("Please enter your existing password and your new password.")).toBeTruthy();
        expect(screen.getByText("Current password")).toBeTruthy();
        expect(screen.getByText("New password")).toBeTruthy();
        expect(screen.getByText("Cancel")).toBeTruthy();
        expect(screen.getByText("Save")).toBeTruthy();
    })

    //password editing functionality will be tested manually
})