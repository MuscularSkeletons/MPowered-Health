import PainRecords from "@/app/(tabs)/(myhealth)/painrecords";
import { getPainHistory, groupPainHistory} from "@/services/healthDataHelper";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { router } from 'expo-router';

jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
        back: jest.fn(),
    },
    useFocusEffect: jest.fn(),
}));

jest.mock('@/services/healthDataHelper', () => ({
    getPainHistory: jest.fn(),
    groupPainHistory: jest.fn(),
    painRecordDate: jest.fn(),
    painMetricValue: jest.fn(),
}))

const mockPainRecords = [
    {
        id: "1",
        completedAt: "01/10/2026",
        areas: ["Head", "Neck"],
        average: 5,
        mildest: 2,
        worst: 8,
    }, 
    {
        id: "2",
        completedAt: "04/10/2026",
        areas: ["Head", "Upper Back"],
        average: 3,
        mildest: 1,
        worst: 5, 
    },
    {
        id: "3",
        completedAt: "06/10/2026",
        areas: ["Head", "Lower Back"],
        average: 7,
        mildest: 5,
        worst: 9, 
    },
    {
        id: "4",
        completedAt: "10/10/2026",
        areas: ["Neck"],
        average: 6,
        mildest: 2,
        worst: 9, 
    },
]

const mockHistory = [
    {
        //key is the pain locations
        key: "Head", 
        //label is the key?
        label: "Head",
        //store the actual values?
        records: mockPainRecords,
    }

]

//rendering tests
describe("rendering objects", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("objects are rendered on screen correctly (no assessment completed yet)", async() => {
        
        (getPainHistory as jest.Mock).mockReturnValue([]);
        (groupPainHistory as jest.Mock).mockReturnValue([]);
        
        await render(<PainRecords/>);
        expect(screen.getByText("TRACKING RECORDS")).toBeTruthy();
        expect(screen.getByText("Pain Records")).toBeTruthy();
        expect(screen.getByText("Chart")).toBeTruthy();
        expect(screen.getByText("History")).toBeTruthy();
        expect(screen.getByText("Print PDF")).toBeTruthy();
        expect(screen.getByText("Pain intensity")).toBeTruthy();
        expect(screen.getByText("No pain areas yet")).toBeTruthy();
        expect(screen.getByText("No pain assessments recorded yet")).toBeTruthy();
        expect(screen.getByText("Records will appear here when pain assessments are available.")).toBeTruthy();
        expect(screen.getByText("Open Pain Tracker")).toBeTruthy();
        expect(screen.queryByText("Recorded")).toBeNull();
    })

    test("pressing history tab when no assessment completed shows a message", async() => {
        (getPainHistory as jest.Mock).mockReturnValue([]);
        (groupPainHistory as jest.Mock).mockReturnValue([]);
        
        await render(<PainRecords/>);
        expect(screen.getByText("Chart")).toBeTruthy();
        expect(screen.getByText("History")).toBeTruthy();
        expect(screen.getByText("Print PDF")).toBeTruthy();
        expect(screen.getByText("Pain intensity")).toBeTruthy();
        expect(screen.getByText("No pain areas yet")).toBeTruthy();
        expect(screen.getByText("No pain assessments recorded yet")).toBeTruthy();
        expect(screen.getByText("Records will appear here when pain assessments are available.")).toBeTruthy();
        expect(screen.getByText("Open Pain Tracker")).toBeTruthy();
        expect(screen.queryByText("Recorded")).toBeNull();
    })

    test("pain record table is rendered with data from the assessment", async() => {
        (getPainHistory as jest.Mock).mockReturnValue(mockHistory);
        (groupPainHistory as jest.Mock).mockReturnValue(mockHistory);

        await render(<PainRecords/>);
        expect(screen.getByText("Recorded")).toBeTruthy();
        expect(screen.getAllByText("Average")).toBeTruthy();
        expect(screen.getAllByText("Worst")).toBeTruthy();
        expect(screen.getAllByText("Mildest")).toBeTruthy();

        expect(screen.getAllByText("7")).toBeTruthy();
        expect(screen.getAllByText("9")).toBeTruthy();
        expect(screen.getAllByText("2")).toBeTruthy();

        expect(screen.queryByText("No pain areas yet")).toBeNull();
        expect(screen.queryByText("No pain assessments recorded yet")).toBeNull();
    })
})

//history tests
describe("history tab tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("history shows records with data from pain assessment", async() => {
        (getPainHistory as jest.Mock).mockReturnValue(mockHistory);
        (groupPainHistory as jest.Mock).mockReturnValue(mockHistory);
        await render(<PainRecords/>);
        await fireEvent.press(screen.getByRole("tab", { name: "History" }));

        expect(screen.getByRole("tab", { name: "History" })).toBeSelected();
        expect(screen.getAllByText("My Pain · Head")).toBeTruthy();
        expect(screen.getAllByText("Average 6/10 · Worst 9/10 · Mildest 2/10")).toBeTruthy();
        expect(screen.getAllByText("Average 7/10 · Worst 9/10 · Mildest 5/10")).toBeTruthy();
        expect(screen.getAllByText("Average 3/10 · Worst 5/10 · Mildest 1/10")).toBeTruthy();
    })
})

//pain metric tabs
describe("pain metric tab tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("average tab is selected by default", async() => {
        (getPainHistory as jest.Mock).mockReturnValue(mockHistory);
        (groupPainHistory as jest.Mock).mockReturnValue(mockHistory);

        await render(<PainRecords/>);
        expect(screen.getByRole("button", {name: "Average"})).toBeSelected();
    })

    test("worst pain tab can be selected", async() => {
        (getPainHistory as jest.Mock).mockReturnValue(mockHistory);
        (groupPainHistory as jest.Mock).mockReturnValue(mockHistory);
 
        await render(<PainRecords/>);
        expect(screen.getByRole("button", {name: "Worst"})).not.toBeSelected();
        await fireEvent.press(screen.getByRole("button", {name: "Worst"}));
        await waitFor(() => {
            expect(screen.getByRole("button", {name: "Worst"})).toBeSelected();
        })
    })

    test("mildest pain tab can be selected", async() => {
        (getPainHistory as jest.Mock).mockReturnValue(mockHistory);
        (groupPainHistory as jest.Mock).mockReturnValue(mockHistory);

        await render(<PainRecords/>);
        expect(screen.getByRole("button", {name: "Mildest"})).not.toBeSelected();
        await fireEvent.press(screen.getByRole("button", {name: "Mildest"}));
        await waitFor(() => {
            expect(screen.getByRole("button", {name: "Mildest"})).toBeSelected();
        }) 
    })
})

//manual tests for filter tabs

//navigation tests
describe("navigation", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing open pain tracker when no records are displayed should navigate to assessment screen", async() => {
        
        (getPainHistory as jest.Mock).mockReturnValue([]);
        (groupPainHistory as jest.Mock).mockReturnValue([]);

        await render(<PainRecords/>);
        await fireEvent.press(screen.getByRole("button", {name: "Open Pain Tracker"}));
        expect(router.push).toHaveBeenCalledWith('/(tabs)/(assessment)');
    })

    test("pressing back should navigate to main my health screen", async() => {
        await render(<PainRecords/>);
        await fireEvent.press(screen.getByText("‹ Back"));
        expect(router.back).toHaveBeenCalled();
    })

    test("pressing history tab should open the history menu", async() => {
        (getPainHistory as jest.Mock).mockReturnValue(mockHistory);
        (groupPainHistory as jest.Mock).mockReturnValue(mockHistory);

        await render(<PainRecords/>);
        await fireEvent.press(screen.getByText("History"));
        expect(screen.getByRole("tab", { name: "History" })).toBeSelected();
        expect(screen.getAllByText("My Pain · Head")).toBeTruthy();
        expect(screen.getAllByText("Average 6/10 · Worst 9/10 · Mildest 2/10")).toBeTruthy();

    })

    test("pressing chart tab from the history tab should open the chart menu", async() => {
        (getPainHistory as jest.Mock).mockReturnValue(mockHistory);
        (groupPainHistory as jest.Mock).mockReturnValue(mockHistory);

        await render(<PainRecords/>);
        await fireEvent.press(screen.getByText("History"));

        expect(screen.getByRole("tab", { name: "History" })).toBeSelected();
        expect(screen.getAllByText("My Pain · Head")).toBeTruthy();
        expect(screen.getAllByText("Average 6/10 · Worst 9/10 · Mildest 2/10")).toBeTruthy();

        await fireEvent.press(screen.getByText("Chart"));
        expect(screen.getByText("Recorded")).toBeTruthy();
        expect(screen.getAllByText("Average")).toBeTruthy();
    })
})