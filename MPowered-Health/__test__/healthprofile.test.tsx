import LatestAssessmentScreen from "@/app/(tabs)/(myhealth)/healthprofile";
import { getLatestAssessments } from "@/services/healthDataHelper";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { router } from 'expo-router';

jest.mock('@/services/healthDataHelper', () => ({
    getLatestAssessments: jest.fn(),
}))

jest.mock("expo-router", () => ({
    router: {
        back: jest.fn(),
    },
    useFocusEffect: jest.fn(),
}));

let mockAssessment : {
    pain: {} | undefined,
    movement: {} | undefined,
    personal: {} | undefined,
    social: {} | undefined, 
    management: {} | undefined
} = {
    pain: {
        completedAt: "01/10/2026",
        answers: [
            ["Head"], 
            ["Throbbing"],
            [5],
            [2],
            [8],
            [6]
        ]
    },
    movement: undefined,
    personal: undefined,
    social: undefined,
    management: undefined,
};

//rendering tests
describe("rendering objects", () => {

    test("objects are rendered on screen correctly (no assessment completed yet)", async() => {
        mockAssessment = {
            pain: undefined,
            movement: undefined, 
            personal: undefined, 
            social: undefined, 
            management: undefined,
        };

        (getLatestAssessments as jest.Mock).mockReturnValue(mockAssessment);
        await render(<LatestAssessmentScreen/>);
        expect(screen.getByText("LATEST ASSESSMENT")).toBeTruthy();
        expect(screen.getByText("My Health Profile")).toBeTruthy();
        expect(screen.getByText("Your newest answers across all five assessment categories.")).toBeTruthy();
        expect(screen.getByText("Print PDF")).toBeTruthy();
        expect(screen.getByText("Share")).toBeTruthy();
        expect(screen.getByText("No completed assessments yet")).toBeTruthy();
        expect(screen.getByText("My Pain")).toBeTruthy();
        expect(screen.getByText("My Movement")).toBeTruthy();
        expect(screen.getByText("My Personal Care")).toBeTruthy();
        expect(screen.getByText("My Social Health")).toBeTruthy();
        expect(screen.getByText("My Management")).toBeTruthy();
        expect(screen.getAllByText("No assessment recorded yet.")).toBeTruthy();
    })
})

//completed assessments
describe("completed assessments", () => {
    beforeEach(() => {
        jest.clearAllMocks(), 
        mockAssessment = {
            pain: {
                completedAt: "01/10/2026",
                answers: [
                    ["Head"], 
                    ["Throbbing"],
                    [5],
                    [2],
                    [8],
                    [6]
                ]
            },
            movement: undefined,
            personal: undefined,
            social: undefined,
            management: undefined,
        };
    })

    test("summary for completed assessment is rendered correctly", async() => {
        (getLatestAssessments as jest.Mock).mockReturnValue(mockAssessment);
        await render(<LatestAssessmentScreen/>);
        expect(screen.getByText("Pain location")).toBeTruthy();
        expect(screen.getByText("Pain characteristics")).toBeTruthy();
        expect(screen.getByText("Current pain")).toBeTruthy();
        expect(screen.getByText("Mildest pain")).toBeTruthy();
        expect(screen.getByText("Worst pain")).toBeTruthy();
        expect(screen.getByText("Average pain")).toBeTruthy();
        expect(screen.getByText("Head")).toBeTruthy();
        expect(screen.getByText("Throbbing")).toBeTruthy();
        expect(screen.getByText("5")).toBeTruthy();
        expect(screen.getByText("2")).toBeTruthy();
        expect(screen.getByText("8")).toBeTruthy();
        expect(screen.getByText("6")).toBeTruthy();
    })  
})

//navigation tests
describe("navigation", () => {
    test("pressing back should navigate to main my health screen", async() => {
        await render(<LatestAssessmentScreen/>);
        fireEvent.press(screen.getByText("‹ Back"));
        expect(router.back).toHaveBeenCalled();
    })
})
