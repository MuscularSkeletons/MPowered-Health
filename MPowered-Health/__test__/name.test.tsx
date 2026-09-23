import StoreName from '../src/app/(auth)/(onboarding)/name';
import {render, screen, fireEvent, userEvent} from '@testing-library/react-native';
import { Alert } from 'react-native';

describe("rendering objects on screen", () => {

    test("screen objects are rendered on screen", async() => {
        await render(<StoreName/>);

        expect(screen.getByText("Name")).toBeTruthy();
        expect(screen.getByPlaceholderText("Name")).toBeTruthy();
        expect(screen.getByText("SUBMIT")).toBeTruthy();
    });

})

describe("input fields", () => {
    test("user is able to type in the input field", async() => {
        await render(<StoreName/>);
        const nameInput = screen.getByPlaceholderText("Name");
        const user = userEvent.setup();

        await user.type(nameInput, "Jane");
        fireEvent.press(screen.getByText("SUBMIT"));
        expect(nameInput.props.value).toBe("Jane");
    })
})

describe("name validation", () => {
    afterEach(() => {
        jest.clearAllMocks();
    })

    test("throw an error for empty strings", async() => {
        jest.spyOn(Alert, "alert");

        await render(<StoreName/>);

        fireEvent.press(screen.getByText("SUBMIT"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "mandatory field missing");

    })

    test("throw an error for names containing only white spaces", async() => {
        jest.spyOn(Alert, "alert");

        await render(<StoreName/>);
        const nameInput = screen.getByPlaceholderText("Name");
        const user = userEvent.setup();

        await user.type(nameInput, " "); 
        fireEvent.press(screen.getByText("SUBMIT"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "white space only is not allowed");

    })


})

//should there be a test for symbols in name?


describe("navigation", () => {
    test("adding a valid name and pressing submit takes to the next screen", async() => {
        await render(<StoreName/>);
        const nameInput = screen.getByPlaceholderText("Name");
        const user = userEvent.setup();

        await user.type(nameInput, "Jane"); 
        fireEvent.press(screen.getByText("SUBMIT"));
        expect(nameInput.props.value).toBe("Jane");
        expect(Alert.alert).not.toHaveBeenCalled();
        //todo: navigate to next screen
    })
})
//submit to next screen
//back to onboarding screen





