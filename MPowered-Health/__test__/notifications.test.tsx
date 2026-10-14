import ManageNotifications from "@/app/(tabs)/(settings)/notifications";
import { render, screen } from "@testing-library/react-native";

describe("objects rendered on screen", () => {
    test("objects are rendered correctly", async() => {
        await render(<ManageNotifications/>);
        expect(screen.getByText("NOTIFICATIONS")).toBeTruthy();
        expect("Manage the timing and frequency of your locations").toBeTruthy();
    })
})