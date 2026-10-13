import { render, screen } from "@testing-library/react-native";

describe("objects rendering", () => {
    test("objects are rendered on screen correctly", async() => {
        await render();
        expect(screen.getByText("My Health")).toBeTruthy();
        expect(screen.getByText("Check my health tracking records")).toBeTruthy();
        expect(screen.getByText("Check my prescriptions")).toBeTruthy();
        expect(screen.getByText("Open my pain profile")).toBeTruthy();
    })
})

//todo: navigation tests
describe("navigation tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })
    
    test("pressing on health tracking records navigates to records", async() => {
        await render();
    })

    test("pressing prescriptions navigates to prescription screen", async() => {
        await render();
    })

    test("pressing pain profile navigates to pain profile", async() => {
        await render();
    })

    test("pressing pain profile navigates to pain profile", async() => {
        await render();
    })
})