//test file for screens with prescription list
import { render, screen, fireEvent } from "@testing-library/react-native";

//mock a list of prescriptions here and check their rendering

describe("objects rendering", () => {
    test("objects are rendered on screen correctly", async() => {
        await render();
        expect(screen.getByText("My Prescriptions")).toBeTruthy();
        expect(screen.getByText("Prescriptions list is empty")).toBeTruthy();
        expect(screen.getByText("Add prescription")).toBeTruthy();
        expect(screen.getByText("< Back")).toBeTruthy();        
    })
})

describe("adding prescriptions", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing on add prescriptions should open a pop up", async() => {
        await render();
        fireEvent.press(screen.getByText("Add prescription"));
    })

    test("open up prescription editor if edit button is pressed", async() => {
        await render();
        fireEvent.press();

        //successful edit
        expect();
    })

    test("delete prescription from list if delete button is pressed", async() => {
        await render();
        fireEvent.press();

        //successful delete
    })
})

describe("prescription information", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("fields are rendered correctly for registration/edit screen", async() => {
        await render();
        expect(screen.getByText("Add prescription")).toBeTruthy();
        expect(screen.getByText("Type the name of your medication")).toBeTruthy();
        expect(screen.getByText("Medication name")).toBeTruthy();
        expect(screen.getByText("Strength")).toBeTruthy();
        expect(screen.getByText("Strength unit")).toBeTruthy();
        expect(screen.getByText("Form")).toBeTruthy();
        expect(screen.getByText("Dosage")).toBeTruthy();
        expect(screen.getByText("How many per application")).toBeTruthy();
        expect(screen.getByText("Repeat every")).toBeTruthy();
        expect(screen.getByText("Unit of time")).toBeTruthy();
        expect(screen.getByText("Save medication")).toBeTruthy();
    })

    //check edits to already registered medication and ensure functions are called with correct values
})

//todo: navigation test
describe("navigation tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing back should navigate to previous page", async() => {
        await render();
    })
})