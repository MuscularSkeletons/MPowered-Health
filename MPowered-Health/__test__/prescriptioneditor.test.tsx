import { render, screen, fireEvent, waitFor, userEvent } from "@testing-library/react-native";
import PrescriptionEditorScreen from "@/app/(tabs)/(myhealth)/(prescriptions)/edit";
import { router, useLocalSearchParams } from "expo-router";
import { usePrescriptionEditor } from "@/context/prescriptionsContext";

const mockChange = jest.fn();
const mockSave = jest.fn();

jest.mock("expo-router", () => ({
    router: {
        back: jest.fn(),
        replace: jest.fn(),
        canGoBack: jest.fn(),
    },
    useLocalSearchParams: jest.fn(),
}));

jest.mock("@/context/prescriptionsContext", () => ({
    usePrescriptionEditor: jest.fn(),
}));

const mockPrescriptions = [
    {   
        id: "1",
        name: "Paracetamol",
        strength: "500",
        unit: "mg",
        form: "Tablet",
        repeat: "6",
        frequency: "hour",
    }
]


//rendering tests
describe("objects on screen", () => {
    
    test("objects on screen are rendered properly", async() => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({});
        (usePrescriptionEditor as jest.Mock).mockReturnValue({
            draft: [],
            change: mockChange,
            validName: true,
            validStrength: true,
            duplicate: false,
            ready:true,
            save: mockSave,
            missing: false,
            validRepeat: true
        });

        await render(<PrescriptionEditorScreen/>);
        expect(screen.getByText("PRESCRIPTIONS")).toBeTruthy();
        expect(screen.getByText("Add Prescription")).toBeTruthy();
        expect(screen.getByText("Medication name")).toBeTruthy();
        expect(screen.getByText("Strength")).toBeTruthy();
        expect(screen.getByText("Strength unit")).toBeTruthy();
        expect(screen.getByText("Form")).toBeTruthy();
        expect(screen.getByText("Repeat every")).toBeTruthy();
        expect(screen.getByText("Unit of time")).toBeTruthy();
        expect(screen.getByText("Save prescription")).toBeTruthy();
    })

    test("heading changes to edit prescription when editing a prescription", async() => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({id: '1'});
        await render(<PrescriptionEditorScreen/>);
        expect(screen.getByText("Edit Prescription")).toBeTruthy();
    })
})

//input validation + button tests
describe("entering prescription information", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("save button is disabled and show error if entering a whitespace for medication name", async() => {
        (usePrescriptionEditor as jest.Mock).mockReturnValue({
            draft: {
                name: '',
                strength: "500",
                unit: "mg",
                form: "Tablet",
                repeat: "6",
                frequency: "hour",
            },
            change: mockChange,
            validName: false,
            validStrength: true,
            duplicate: false,
            ready: false,
            save: mockSave,
            missing: false,
            validRepeat: true
        });
        await render(<PrescriptionEditorScreen/>); 
        expect(screen.getByText("Medication name is required.")).toBeTruthy();
        expect(screen.getByRole("button", {name: "Save prescription"})).toBeDisabled();
    })
    
    test("save button is disabled and show error if no input for strength", async() => {
        (usePrescriptionEditor as jest.Mock).mockReturnValue({
            draft: {
                name: 'Paracetamol',
                strength: "",
                unit: "mg",
                form: "Tablet",
                repeat: "6",
                frequency: "hour",
            },
            change: mockChange,
            validName: true,
            validStrength: false,
            duplicate: false,
            ready: false,
            save: mockSave,
            missing: false,
            validRepeat: true
        });
        await render(<PrescriptionEditorScreen/>); 
        expect(screen.getByText("Enter a strength greater than zero.")).toBeTruthy();
        expect(screen.getByRole("button", {name: "Save prescription"})).toBeDisabled();
    })

    test("save button is disabled and show error if no input for repeats", async() => {
        (usePrescriptionEditor as jest.Mock).mockReturnValue({
            draft: {
                name: 'Paracetamol',
                strength: "500",
                unit: "mg",
                form: "Tablet",
                repeat: "",
                frequency: "hour",
            },
            change: mockChange,
            validName: true,
            validStrength: true,
            duplicate: false,
            ready: false,
            save: mockSave,
            missing: false,
            validRepeat: false
        });
        await render(<PrescriptionEditorScreen/>); 
        expect(screen.getByText("Enter a value greater than zero.")).toBeTruthy();
        expect(screen.getByRole("button", {name: "Save prescription"})).toBeDisabled();
    })

    test("entering a duplicate name for medication name should throw an error", async() => {
        (usePrescriptionEditor as jest.Mock).mockReturnValue({
            draft: mockPrescriptions,
            change: mockChange,
            validName: true,
            validStrength: true,
            duplicate: true,
            ready: false,
            save: mockSave,
            missing: false,
            validRepeat: true,
        });
        await render(<PrescriptionEditorScreen/>); 
        expect(screen.getByText('You have already added a prescription with this name, strength and unit.')).toBeTruthy();
    })
})

//manually test the dropdown options
describe("editing prescription information", () => {
        
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("can edit prescription name", async() => {
        (usePrescriptionEditor as jest.Mock).mockReturnValue({
            draft: mockPrescriptions,
            change: mockChange,
            validName: true,
            validStrength: true,
            duplicate: false,
            ready: true,
            save: mockSave,
            missing: false,
            validRepeat: true,
        });        
        await render(<PrescriptionEditorScreen/>);
        const user = userEvent.setup();

        await user.clear(screen.getByPlaceholderText("Medication name"));
        await user.type(screen.getByPlaceholderText("Medication name"), "Ibuprofen");

        expect(mockChange).toHaveBeenCalledWith("name", "Ibuprofen");
    })

    test("can edit prescription strength", async() => {
        (usePrescriptionEditor as jest.Mock).mockReturnValue({
            draft: mockPrescriptions,
            change: mockChange,
            validName: true,
            validStrength: true,
            duplicate: false,
            ready: true,
            save: mockSave,
            missing: false,
            validRepeat: true,
        });        
        await render(<PrescriptionEditorScreen/>);
        const user = userEvent.setup();

        await user.clear(screen.getByPlaceholderText("Strength"));
        await user.type(screen.getByPlaceholderText("Strength"), "100");

        expect(mockChange).toHaveBeenCalledWith("strength", "100");
    })
    
    test("can edit prescription repeats", async() => {
        (usePrescriptionEditor as jest.Mock).mockReturnValue({
            draft: mockPrescriptions,
            change: mockChange,
            validName: true,
            validStrength: true,
            duplicate: false,
            ready: true,
            save: mockSave,
            missing: false,
            validRepeat: true,
        });        
        await render(<PrescriptionEditorScreen/>);
        const user = userEvent.setup();

        await user.clear(screen.getByPlaceholderText("Repeat every"));
        await user.type(screen.getByPlaceholderText("Repeat every"), "2");

        expect(mockChange).toHaveBeenCalledWith("repeat", "2");
    })
})

//valid submission
describe("submitting to database", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing save should submit to database", async() => {
        (usePrescriptionEditor as jest.Mock).mockReturnValue({
            draft: mockPrescriptions,
            change: mockChange,
            validName: true,
            validStrength: true,
            duplicate: false,
            ready: true,
            save: mockSave,
            missing: false,
            validRepeat: true,
        });
        await render(<PrescriptionEditorScreen/>);  
        await fireEvent.press(screen.getByText("Save prescription"));
        expect(mockSave).toHaveBeenCalled();  
    })

    test("unsuccessful submission to database should not navigate anywhere", async() => {
        mockSave.mockResolvedValue(false);

        (usePrescriptionEditor as jest.Mock).mockReturnValue({
            draft: mockPrescriptions,
            change: mockChange,
            validName: true,
            validStrength: true,
            duplicate: false,
            ready: true,
            save: mockSave,
            missing: false,
            validRepeat: true,
        });
        await render(<PrescriptionEditorScreen/>);  
        await fireEvent.press(screen.getByText("Save prescription"));
        await waitFor(() => {
            expect(mockSave).toHaveBeenCalled(); 
        })       

        expect(router.back).not.toHaveBeenCalled();
    })
})

//missing prescription
describe("missing prescriptions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("missing prescription should throw an error", async() => {
        (usePrescriptionEditor as jest.Mock).mockReturnValue({
            draft: mockPrescriptions,
            change: mockChange,
            validName: true,
            validStrength: true,
            duplicate: false,
            ready: true,
            save: mockSave,
            missing: true,
            validRepeat: true,
        });
        await render(<PrescriptionEditorScreen/>);  
        expect(screen.getByText("This prescription is no longer available.")).toBeTruthy();
        expect(screen.getByText("Back to prescriptions")).toBeTruthy();
    })

    test("pressing back to prescriptons should navigate back to main prescription screen", async() => {
        (usePrescriptionEditor as jest.Mock).mockReturnValue({
            draft: mockPrescriptions,
            change: mockChange,
            validName: true,
            validStrength: true,
            duplicate: false,
            ready: true,
            save: mockSave,
            missing: true,
            validRepeat: true,
        });
        await render(<PrescriptionEditorScreen/>);  
        expect(screen.getByText("This prescription is no longer available.")).toBeTruthy();
        expect(screen.getByText("Back to prescriptions")).toBeTruthy();
        
        await fireEvent.press(screen.getByText("Back to prescriptions"));
        expect(router.replace).toHaveBeenCalledWith('/(tabs)/(myhealth)/(prescriptions)');
    })
})

//navigation
describe("navigation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("pressing save should navigate back to prescriptions main screen", async() => {
        mockSave.mockResolvedValue(true);
        (usePrescriptionEditor as jest.Mock).mockReturnValue({
            draft: mockPrescriptions,
            change: mockChange,
            validName: true,
            validStrength: true,
            duplicate: false,
            ready: true,
            save: mockSave,
            missing: false,
            validRepeat: true,
        });
        await render(<PrescriptionEditorScreen/>);

        await fireEvent.press(screen.getByText("Save prescription"));
        await waitFor(() => {
            expect(mockSave).toHaveBeenCalled();
            expect(router.replace).toHaveBeenCalledWith('/(tabs)/(myhealth)/(prescriptions)');            
        })
    })

    test("pressing back should navigate back to prescriptions main screen", async() => {
        await render(<PrescriptionEditorScreen/>);
        await fireEvent.press(screen.getByText("‹ Back"));
        expect(router.back).toHaveBeenCalled();
    })
})
