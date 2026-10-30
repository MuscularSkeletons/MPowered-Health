import ManageNotifications from "@/app/(tabs)/(settings)/notifications";
import { fireEvent, render, screen } from "@testing-library/react-native";

const mockBack = jest.fn();

//mocking expo router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        back: mockBack,
    })
}))

describe("objects rendered on screen", () => {
    test("objects are rendered correctly", async() => {
        await render(<ManageNotifications/>);
        expect(screen.getByText("NOTIFICATIONS")).toBeTruthy();
        expect(screen.getByText("Notification preferences")).toBeTruthy();
        expect(screen.getByText("Choose how and when you receive reminders.")).toBeTruthy();
        expect(screen.getByText("You are in control")).toBeTruthy();
        expect(screen.getByText("Your reminder options will appear here when this feature becomes available.")).toBeTruthy();
    })
})

describe("navigation tests", () => {
    test("pressing back should navigate back to settings main page", async() => {
        await render(<ManageNotifications/>);
        fireEvent.press(screen.getByText("‹ Back"));
        expect(mockBack).toHaveBeenCalled();
    })
})