import Questions from "@/app/(tabs)/(questions)/questions";
import { render, screen } from "@testing-library/react-native";

//questions main screen rendering
describe("question main screen", () => {
    test("objects are rendered correctly (no questions added)", async() => {
        await render(<Questions/>);
        expect(screen.getByText("YOUR QUESTIONS")).toBeTruthy();
        expect(screen.getByText("Appointment Preparation")).toBeTruthy();
        expect(screen.getByText("Add questions you would like to discuss with your healthcare professional/s.")).toBeTruthy();
        expect(screen.getByText("No questions created. Press the + button to start adding questions!")).toBeTruthy();
        expect(screen.getByText("Supported by ABBVIE"));
    })
})

