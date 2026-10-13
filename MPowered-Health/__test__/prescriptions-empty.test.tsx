//test file for screen with no prescriptions added

import { fireEvent, render, screen } from "@testing-library/react-native";

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