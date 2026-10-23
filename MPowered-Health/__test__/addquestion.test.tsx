import AddQuestion from "@/app/(tabs)/(questions)/addquestion";
import { render, screen } from "@testing-library/react-native";

//add question screen rendering
describe("add question screen", () => {
    test("objects are rendered correctly", async() => {
        await render(<AddQuestion/>);
        expect(screen.getByText("QUESTIONS")).toBeTruthy();
        expect(screen.getByText("Add Questions")).toBeTruthy();
        expect(screen.getByText("Questions are generated based on your assessment answers. Please complete your assessments for accurate suggestions.")).toBeTruthy();
        expect(screen.getByText("Click the checkbox next to any questions you wish to add to your appointment plan.")).toBeTruthy();
        expect(screen.getByText("Pain Location")).toBeTruthy();
        expect(screen.getByText("Pain Intensity")).toBeTruthy();
        expect(screen.getByText("Pain Impact")).toBeTruthy();
        expect(screen.getByText("Management")).toBeTruthy();
        expect(screen.getByText("Other")).toBeTruthy();
        expect(screen.getByText("Add your own question")).toBeTruthy();
        expect(screen.getByText("Save")).toBeTruthy();
    })
})