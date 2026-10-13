import { fireEvent, render, screen } from "@testing-library/react-native";

//mock user with assessment info here

describe("rendering objects", () => {
    test("objects are rendered on screen properly", async() => {
        await render();
        //pain assessment
        expect(screen.getByText("My Pain")).toBeTruthy();
        expect(screen.getByText("Severity of my pain, pattern and location")).toBeTruthy();
        expect(screen.getByText("My Pain location")).toBeTruthy();
        expect(screen.getByText("My Current pain")).toBeTruthy();
        expect(screen.getByText("Average pain (2 weeks): ")).toBeTruthy();
        expect(screen.getByText("Worst pain: ")).toBeTruthy();
        expect(screen.getByText("Mildest pain: ")).toBeTruthy();
        expect(screen.getByText("Pain characteristics")).toBeTruthy();

        //movement assessment
        expect(screen.getByText("Impacts to Movement")).toBeTruthy();
        expect(screen.getByText("Average activity hour: ")).toBeTruthy();
        expect(screen.getByText("General Movement: ")).toBeTruthy();
        expect(screen.getByText("Walking: ")).toBeTruthy();
        expect(screen.getByText("Lifting: ")).toBeTruthy();
        expect(screen.getByText("Sitting: ")).toBeTruthy();
        expect(screen.getByText("Standing: ")).toBeTruthy();

        //personal care assessment
        expect(screen.getByText("Impacts to Personal Care")).toBeTruthy();
        expect(screen.getByText("General Activities: ")).toBeTruthy();
        expect(screen.getByText("Personal care (washing, dressing, etc.) ")).toBeTruthy();
        expect(screen.getByText("Sleeping: ")).toBeTruthy();

        //social health assessment
        expect(screen.getByText("Impacts to Social Health")).toBeTruthy();
        expect(screen.getByText("Social life: ")).toBeTruthy();
        expect(screen.getByText("Travelling: ")).toBeTruthy();
        expect(screen.getByText("Mood: ")).toBeTruthy();
        expect(screen.getByText("Relation with others")).toBeTruthy();
        expect(screen.getByText("Enjoyment of life")).toBeTruthy();

        //management
        expect(screen.getByText("My Current Management")).toBeTruthy();
        expect(screen.getByText("Medication: ")).toBeTruthy();
        expect(screen.getByText("Exercise: ")).toBeTruthy();
        expect(screen.getByText("Emotion: ")).toBeTruthy();

        expect(screen.getByText("< Back")).toBeTruthy();
    })
})

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