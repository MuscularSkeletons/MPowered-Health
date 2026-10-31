import { render, screen, fireEvent } from "@testing-library/react-native";
import MyHealthScreen from "@/app/(tabs)/(myhealth)";
import { router } from "expo-router";
import { getPainHistory, loadHealthRecords } from "@/services/healthDataHelper";

jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
    },
    useFocusEffect: jest.fn(),
}));

jest.mock("@/services/healthDataHelper", () => ({
    getPainHistory: jest.fn(() => []),
    loadHealthRecords: jest.fn(() => Promise.resolve()),
    painRecordDate: jest.fn(() => "01/10/2026"),
}));

const mockHealthRecords = [
    {id: '1', completedAt: '01/10/2026', areas: ['Head', 'Leg'], current: 5, mildest: 3, worst: 9, average: 7},
    {id: '2', completedAt: '06/10/2026', areas: ['Head'], current: 8, mildest: 5, worst: 10, average: 8},
    {id: '3', completedAt: '06/10/2026', areas: ['Head'], current: 8, mildest: 5, worst: 10, average: 8},
  ]

describe("objects rendering", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getPainHistory as jest.Mock).mockReturnValue([]);
        (loadHealthRecords as jest.Mock).mockResolvedValue(undefined);
    });

    test("objects are rendered on screen correctly (no pain assessment done yet)", async() => {
        await render(<MyHealthScreen />);
        expect(screen.getByText("MY HEALTH")).toBeTruthy();
        expect(screen.getByText("Understand your health over time")).toBeTruthy();
        expect(screen.getByText("Review your pain trends and keep your prescriptions in one place.")).toBeTruthy();
        expect(screen.getByText("My health profile")).toBeTruthy();
        expect(screen.getAllByText("View ›")).toBeTruthy();
        expect(screen.getByText("My prescriptions")).toBeTruthy();
        expect(screen.getByText("Average pain trend")).toBeTruthy();
        expect(screen.getByText("Your five most recent pain assessments")).toBeTruthy();
        expect(screen.getByText("No pain records yet")).toBeTruthy();
        expect(screen.getByText(/0 records/)).toBeTruthy();
        expect(screen.getByText("Complete a pain assessment to see your progress here.")).toBeTruthy();
        expect(screen.getByText("View all pain records")).toBeTruthy();
        expect(screen.getByText("Supported by ABBVIE")).toBeTruthy();
    });
});


// navigation tests
describe("navigation tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        (getPainHistory as jest.Mock).mockReturnValue([]);
    });

    test("pressing health profile navigates to health profile", async() => {
        await render(<MyHealthScreen />);

        fireEvent.press(screen.getByText("My health profile"));

        expect(router.push).toHaveBeenCalledWith("/(tabs)/(myhealth)/healthprofile");
    });

    test("pressing prescriptions navigates to prescription screen", async() => {
        await render(<MyHealthScreen />);

        fireEvent.press(screen.getByText("My prescriptions"));

        expect(router.push).toHaveBeenCalledWith("/(tabs)/(myhealth)/(prescriptions)");
    });

    test("pressing pain records navigates to records", async() => {
        await render(<MyHealthScreen />);

        fireEvent.press(screen.getByText("View all pain records"));

        expect(router.push).toHaveBeenCalledWith("/(tabs)/(myhealth)/painrecords");
    });
});

// empty graph tests
describe("empty average pain graph", () => {
    test("shows message when no pain records exist", async() => {
        (getPainHistory as jest.Mock).mockReturnValue([]);

        await render(<MyHealthScreen />);

        expect(screen.getByText("No pain records yet")).toBeTruthy();
        expect(screen.getByText("Complete a pain assessment to see your progress here.")).toBeTruthy();
    });
});

//graph with dummy data
describe("average pain graph with records", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("graph shows a trend when records are available", async() => {
        (getPainHistory as jest.Mock).mockReturnValue(mockHealthRecords);
        await render(<MyHealthScreen/>);

        expect(screen.queryByText("No pain records yet")).toBeNull();
        expect(screen.getByText(/3 records/)).toBeTruthy();
    })
})
