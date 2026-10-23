import { render, screen, fireEvent } from "@testing-library/react-native";

describe("objects rendering", () => {
    test("objects are rendered on screen correctly", async() => {
        await render();
        expect(screen.getByText("My health tracking records")).toBeTruthy();
        expect(screen.getByText("Print PDF")).toBeTruthy();
        expect(screen.getByText("Chart")).toBeTruthy();
        expect(screen.getByText("Pain intensity")).toBeTruthy();
        expect(screen.getByText("Average")).toBeTruthy();
        expect(screen.getByText("Worst")).toBeTruthy();
        expect(screen.getByText("Mildest")).toBeTruthy();
        expect(screen.getByText("See more records")).toBeTruthy();
        
        //render chart
    })
})

//tests for graph: maybe use dummy data and check if rendered properly

describe("pdf generation and share tests", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing pdf should generate a pdf", async() => {
        await render();
        fireEvent.press(screen.getByText("Print PDF"));

        expect("").toHaveBeenCalled();
    })

    test("generated pdf can be shared", async() => {
        await render();
    })
})

//todo: navigation tests
describe("navigation tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing back should navigate to my health homepage", async() => {
        await render();
    })
})