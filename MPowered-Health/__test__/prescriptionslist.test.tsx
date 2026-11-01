
import { render, screen, fireEvent } from "@testing-library/react-native";
import PrescriptionsScreen from "@/app/(tabs)/(myhealth)/(prescriptions)";
import { router } from "expo-router";
import { PrescriptionProvider, usePrescriptions } from "@/context/prescriptionsContext";
import { prescriptionLabel } from "@/services/prescriptionHelper";

const mockPrescriptions = [
    {   
        id: '1',
        name: "Paracetamol",
        strength: "500",
        unit: "mg",
        form: "Tablet",
        repeat: "6",
        frequency: "hour",
    }, 
    {
        id: '2',
        name: "Amlodipine",
        strength: "100",
        unit: "mg",
        form: "Tablet",
        repeat: "1",
        frequency: "day",
    }
]

const mockRemove = jest.fn();
const mockReload = jest.fn();

jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
        back: jest.fn(),
    },
}));

jest.mock("@/context/prescriptionsContext", () => ({
    usePrescriptions: jest.fn(),
}));

//rendering tests
describe("objects on screen", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })
    
    test("objects on screen are rendered properly (no prescriptions added yet) ", async() => {
        (usePrescriptions as jest.Mock).mockReturnValue(
            {
                list: [],
                remove: jest.fn(),
                loadFailed: false,
                reload: jest.fn(),
            },
        )
        await render(<PrescriptionsScreen/>);
        expect(screen.getByText("PRESCRIPTIONS")).toBeTruthy();
        expect(screen.getByText("Add prescription")).toBeTruthy();
        expect(screen.getByText("Prescriptions List")).toBeTruthy();
        expect(screen.getByText("No prescriptions added yet.")).toBeTruthy();
        expect(screen.getByText("‹ Back")).toBeTruthy();
    })

    test("show prescriptions when prescriptions exist", async() => {
        (usePrescriptions as jest.Mock).mockReturnValue(
            {
                list: mockPrescriptions,
                remove: jest.fn(),
                loadFailed: false,
                reload: jest.fn(),
            },
        )
        await render(<PrescriptionsScreen/>);
        expect(screen.getByText("Paracetamol 500 mg — 6 times hourly")).toBeTruthy();
        expect(screen.getByText("Amlodipine 100 mg — Once daily")).toBeTruthy();
        expect(screen.getByLabelText("Edit Paracetamol 500 mg — 6 times hourly")).toBeTruthy();
        expect(screen.getByLabelText("Delete Paracetamol 500 mg — 6 times hourly")).toBeTruthy();
        expect(screen.getByLabelText("Edit Amlodipine 100 mg — Once daily")).toBeTruthy();
        expect(screen.getByLabelText("Delete Amlodipine 100 mg — Once daily")).toBeTruthy();
        expect(screen.getByText("Add prescription")).toBeTruthy();
        expect(screen.queryByText("No prescriptions added yet.")).toBeNull();
    })

    test("display error message if loading prescriptions fails", async() => {
        (usePrescriptions as jest.Mock).mockReturnValue(
            {
                list: [],
                remove: jest.fn(),
                loadFailed: true,
                reload: jest.fn(),
            },
        )
        await render(<PrescriptionsScreen/>);
        expect(screen.getByText("Your prescriptions could not be loaded.")).toBeTruthy();
        expect(screen.getByText("Retry")).toBeTruthy();
    })
})

//delete prescription
describe("deleting prescriptions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })
    
    test("pressing delete prescription should delete the prescription", async() => {
        (usePrescriptions as jest.Mock).mockReturnValue(
            {
                list: mockPrescriptions,
                remove: mockRemove,
                loadFailed: false,
                reload: jest.fn(),
            },
        )
        await render(<PrescriptionsScreen/>);
        await fireEvent.press(screen.getByLabelText("Delete Paracetamol 500 mg — 6 times hourly"));
        expect(mockRemove).toHaveBeenCalled();
    })
})

//reload screen
describe("reloading prescriptions list", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })
    
    test("pressing retry should reload the list", async() => {
        (usePrescriptions as jest.Mock).mockReturnValue(
            {
                list: [],
                remove: jest.fn(),
                loadFailed: true,
                reload: mockReload,
            },
        )
        await render(<PrescriptionsScreen/>);
        fireEvent.press(screen.getByText("Retry"));
        expect(mockReload).toHaveBeenCalled();
    })
})

//navigation tests
describe("navigation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing add prescription should navigate to add prescription screen", async() => {
        (usePrescriptions as jest.Mock).mockReturnValue(
            {
                list: [],
                remove: jest.fn(),
                loadFailed: false,
                reload: jest.fn(),
            },
        )
        await render(<PrescriptionsScreen/>);
        await fireEvent.press(screen.getByText("Add prescription"));
        expect(router.push).toHaveBeenCalledWith('./edit');
    })

    test("pressing edit prescription should navigate to edit prescription screen", async() => {
        (usePrescriptions as jest.Mock).mockReturnValue(
            {
                list: mockPrescriptions,
                remove: jest.fn(),
                loadFailed: false,
                reload: jest.fn(),
            },
        )
        await render(<PrescriptionsScreen/>);
        await fireEvent.press(screen.getByLabelText("Edit Paracetamol 500 mg — 6 times hourly"));
        expect(router.push).toHaveBeenCalledWith({
            pathname: "/(tabs)/(myhealth)/(prescriptions)/edit",
            params : {id : "1"},
        });
    })

    test("pressing back should navigate to main my health screen", async() => {
        await render(<PrescriptionsScreen/>);
        await fireEvent.press(screen.getByText("‹ Back"));
        expect(router.back).toHaveBeenCalled();
    })
})
