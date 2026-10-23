import AssessmentScreen from '@/components/assessment/assessmentScreen';
import { managementQuestions } from '@/constants/assessmentQuestions/managementQuestions';
import { submitAssessmentAnswers } from '@/hooks/useAssessments';
import { usePrescriptions } from '@/context/prescriptionsContext';
import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { PrescriptionItem } from '@/types/prescriptions';

const mockUser = jest.fn(() => Promise.resolve('mocked user'));
const onBack = jest.fn();
const mockPrescriptions : PrescriptionItem[] = [
    {id: '1', name: 'Perindopril arginine', strength: "5", unit: "mg", form: "Tablet", frequency: 'day', repeat: "1"},
    {id: '2', name: 'Paracetamol', strength: "500", unit: "mg", form: "Tablet", frequency: 'day', repeat: "3"},
    {id: '3', name: 'A very long prescription name', strength: "80", unit: "mg", form: "Tablet", frequency: 'day', repeat: "1"},
];

//3 items in the prescription list
const medications = [mockPrescriptions[0], mockPrescriptions[1], mockPrescriptions[2]];

jest.mock("@/context/authcontext", () => ({
    useAuth: () => ({
        user: mockUser,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
        isLoading: false,
    }),
}));

jest.mock('@/hooks/useAssessments', () => ({
    submitAssessmentAnswers: jest.fn(),
}))
 
jest.mock('@/context/prescriptionsContext', () => ({
    usePrescriptions: jest.fn(),
}))

// rendering test
describe("my management assessment questions are rendered on screen", () => {
    
    beforeEach(async() => {
        (usePrescriptions as jest.Mock).mockReturnValue({
            list: medications,
        })
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);
    
    test("question 1 (Medication) is rendered on screen", () => {
        expect(screen.getByText('Medication')).toBeTruthy();
        expect(screen.getByText("My Management")).toBeTruthy();
        expect(screen.getByText('Over the past week, select medications that you consumed to manage your pain.')).toBeTruthy();
        expect(screen.getByText('Not taking medications? You can continue without selecting an option. This list is generated from your medication records.')).toBeTruthy();
        
        // options
        expect(screen.getByText("Perindopril arginine 5 mg — Once daily")).toBeTruthy();
        expect(screen.getByText("Paracetamol 500 mg — 3 times daily")).toBeTruthy();
        expect(screen.getByText("A very long prescription name 80 mg — Once daily")).toBeTruthy();
        
        expect(screen.getByText('1/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 2 (Medication) is rendered on screen", async() => {
        //navigate to question 2
        await fireEvent.press(screen.getByText("Perindopril arginine 5 mg — Once daily"));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        expect(screen.getByText('Medication')).toBeTruthy();
        expect(screen.getByText('Over the past week, did you take any over-the-counter (OTC) medication?')).toBeTruthy();
        expect(screen.getByText('Not taking OTC medication? You can continue without entering a medication.')).toBeTruthy();
        
        // text
        expect(screen.getByPlaceholderText('Input name of over the counter medication')).toBeTruthy();
        
        expect(screen.getByText('2/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 3 (Exercise) is rendered on screen", async() => {
        
        //navigate to question 3
        await fireEvent.press(screen.getByText("Perindopril arginine 5 mg — Once daily"));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));
        
        expect(screen.getByText('Exercise')).toBeTruthy();
        expect(screen.getByText('In the past 7 days, did you perform any exercises to manage your musculoskeletal pain or improve your movement?')).toBeTruthy();
        expect(screen.getByText('Examples include walking, stretching, strengthening, yoga, resistance-band work, or balance exercises.')).toBeTruthy();
        // options
        expect(screen.getByText('0 days')).toBeTruthy();
        expect(screen.getByText('1-2 days')).toBeTruthy();
        expect(screen.getByText('3-4 days')).toBeTruthy();
        expect(screen.getByText('5-6 days')).toBeTruthy();
        expect(screen.getByText('7 days')).toBeTruthy();
        
        expect(screen.getByText('3/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });
    
    test("question 4 (Emotion) is rendered on screen", async() => {
        
        //navigate to question 4
        await fireEvent.press(screen.getByText("Perindopril arginine 5 mg — Once daily"));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));
        await fireEvent.press(screen.getByText("0 days"));
        await fireEvent.press(screen.getByRole("button", {name : "Record"}));
        
        expect(screen.getByText('Emotion')).toBeTruthy();
        expect(screen.getByText('Over the past week, did you perform any strategies to manage your stress level or emotion?')).toBeTruthy();
        expect(screen.getByText('Examples include meditation, journaling, or meeting with people.')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('Write your strategies')).toBeTruthy();
        
        expect(screen.getByText('4/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
    });
});

//if prescriptions is not added, show default values
describe("no prescriptions list", () => {
    
    beforeEach(async() => {
        (usePrescriptions as jest.Mock).mockReturnValue({
            list: [],
        })
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
    });
    
    afterEach(jest.clearAllMocks);
    
    test("render a message if no prescriptions have been added on question 1", async() => {
        expect(screen.getByText('Medication')).toBeTruthy();
        expect(screen.getByText("My Management")).toBeTruthy();
        expect(screen.getByText('Over the past week, select medications that you consumed to manage your pain.')).toBeTruthy();
        expect(screen.getByText('Not taking medications? You can continue without selecting an option. This list is generated from your medication records.')).toBeTruthy();
        // options
        expect(screen.getByText('No prescriptions added yet.')).toBeTruthy();
        
        expect(screen.getByText('1/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();        
    })
})

// selection/input tests
describe("my management assessment questions are selected/inputted correctly", () => {
    
    beforeEach(async() => {
        (usePrescriptions as jest.Mock).mockReturnValue({
            list: medications,
        })
    
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
    });
    
    afterEach(jest.clearAllMocks);
    
    test("can select multiple options for question 1", async() => {
        await fireEvent.press(screen.getByText("Perindopril arginine 5 mg — Once daily"));
        await fireEvent.press(screen.getByText("A very long prescription name 80 mg — Once daily"));
        expect(screen.getByRole('button', { name: 'Record' })).toBeEnabled();
    });
    
    test("user can enter a text response for question 2", async() => {
    
        //navigate to question 2
        await fireEvent.press(screen.getByText("Perindopril arginine 5 mg — Once daily"));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
    
        const otcMedication = screen.getByPlaceholderText("Input name of over the counter medication");
        const user = userEvent.setup();
        await user.type(otcMedication, "Ibuprofen");
    
        expect(otcMedication.props.value).toBe("Ibuprofen");
    });
    
    /*
    question 3 only allows selecting one option, so the test is same as the record button test
    for question 3 where the record button is enabled when an option is selected
    */

    test("user can enter a text response for question 4", async() => {
        //navigate to question 4
        await fireEvent.press(screen.getByText("Perindopril arginine 5 mg — Once daily"));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));
        await fireEvent.press(screen.getByText("0 days"));
        await fireEvent.press(screen.getByRole("button", {name : "Record"}));
    
        const emotionStrategies = screen.getByPlaceholderText("Write your strategies");
        const user = userEvent.setup();
        await user.type(emotionStrategies, "Meditation");
   
        expect(emotionStrategies.props.value).toBe("Meditation");
    });

});

// input validation tests testing the 500 character limit
describe("input validation for question 2 & 4", () => {

    afterEach(jest.clearAllMocks);

    test("500 character limit test for question 2 ", async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
        //navigate to question 2
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        const otcMedication = screen.getByPlaceholderText("Input name of over the counter medication");
        await fireEvent.changeText(otcMedication, "medication medication medication medication medication medication medication medication medication medication Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibu");
        expect(otcMedication.props.value).toHaveLength(500);
    });

    test("500 character limit test for question 4 ", async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
        //navigate to question 4
        await fireEvent.press(screen.getByText("Perindopril arginine 5 mg — Once daily"));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));
        await fireEvent.press(screen.getByText("0 days"));
        await fireEvent.press(screen.getByRole("button", {name : "Record"}));
        const emotionStrategies = screen.getByPlaceholderText("Write your strategies");
        await fireEvent.changeText(emotionStrategies, "Meditation Meditation Meditation Meditation Meditation Meditation Meditation Meditation Meditation Meditation Meditation Meditation Meditation Meditation Meditation Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibu");  
        expect(emotionStrategies.props.value).toHaveLength(500);
    });
});

describe("record button tests", () => {

    afterEach(jest.clearAllMocks);
    
    test("no prescription list added and record button is enabled for question 1", async() => {
        //if users have not added a prescription list, they can skip this question by pressing record
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    })

    test("prescription list addded and record button is enabled even when no option is selected for question 2", async() => {
        
        (usePrescriptions as jest.Mock).mockReturnValue({
            list: medications,
        })
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
        
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();      
    })

    test("prescription list addded and record button is enabled when options are selected for question 2", async() => {
        
        (usePrescriptions as jest.Mock).mockReturnValue({
            list: medications,
        })
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
        await fireEvent.press(screen.getByText("Perindopril arginine 5 mg — Once daily"));
        await fireEvent.press(screen.getByText("A very long prescription name 80 mg — Once daily"));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();      
    })

    test("record button is enabled when no text is entered for question 2", async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
        
        //navigate to question 2
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        //if users do not take any otc medication, they can skip this question by pressing record
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();          
    })

    test("record button is enabled when otc medication is entered for question 2", async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
        
        //navigate to question 2
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        const user = userEvent.setup();
        const otcMedicationInput = screen.getByPlaceholderText("Input name of over the counter medication");
        await user.type(otcMedicationInput, 'A very long medication name that I have to take');
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();          
    })

    test("record button is disabled when no option is selected for question 3", async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
        //navigate to question 3
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();  
    })

    test("record button is enabled when a value is selected for question 3", async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
        //navigate to question 3
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('1-2 days'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();  
    })

    test("record button is enabled when no text is entered for question 4", async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
        //navigate to question 4
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('1-2 days'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));        
    
        expect(screen.getByRole("button", {name: "Review"})).toBeEnabled();      
    })

    test("record button is enabled when text is entered for question 4", async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
        //navigate to question 4
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('1-2 days'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        
        const emotionStrategies = screen.getByPlaceholderText("Write your strategies");
        const user = userEvent.setup();
        await user.type(emotionStrategies, "Meditation");
    
        expect(screen.getByRole("button", {name: "Review"})).toBeEnabled();      
    })
})

describe("summary screen tests", () => {

    afterEach(jest.clearAllMocks);

    test("objects are rendered on screen correctly", async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack} existingAnswers={{
            medication:'Amlodipine 5 mg — Once daily',
            otc_medication:'Panadol', 
            exercise_frequency:'1-2 days', 
            emotion_strategies:'Meditation'
        }}/>);

        //question 1
        expect(screen.getByText("1/4")).toBeTruthy();
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 2
        expect(screen.getByText("2/4")).toBeTruthy();
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));

        //question 3
        expect(screen.getByText("3/4")).toBeTruthy();
        await fireEvent.press(screen.getByRole("button", {name : "Record"}));

        //question 4
        expect(screen.getByText("4/4")).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));
        expect(screen.getByText("My Management Summary")).toBeTruthy();
        expect(screen.getByText("This helps guide your treatment and support your recovery.")).toBeTruthy();
        expect(screen.getByText("My Management")).toBeTruthy();

        //questions
        expect(screen.getByText("Over the past week, select medications that you consumed to manage your pain.")).toBeTruthy();
        expect(screen.getByText("Over the past week, did you take any over-the-counter (OTC) medication?")).toBeTruthy();
        expect(screen.getByText("In the past 7 days, did you perform any exercises to manage your musculoskeletal pain or improve your movement?")).toBeTruthy();
        expect(screen.getByText("Over the past week, did you perform any strategies to manage your stress level or emotion?")).toBeTruthy();

        //user's answers
        expect(screen.getByText("Amlodipine 5 mg — Once daily")).toBeTruthy();
        expect(screen.getByText(/Panadol/)).toBeTruthy();
        expect(screen.getByText('1-2 days')).toBeTruthy();
        expect(screen.getByText('Meditation')).toBeTruthy();

        //headings
        expect(screen.getByText("Medication")).toBeTruthy();
        expect(screen.getByText("Exercise")).toBeTruthy();
        expect(screen.getByText("Emotion")).toBeTruthy();

        //message
        expect(screen.getByText("Your answers have been saved.")).toBeTruthy();

        //buttons
        expect(screen.getByText("Edit")).toBeTruthy();
        expect(screen.getByText("Close")).toBeTruthy();
    })

    test("summary screen shows null values for the skipped questions", async() => {
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack} existingAnswers={{
            exercise_frequency:'0 days', 
        }}/>)

        //question 1
        expect(screen.getByText("1/4")).toBeTruthy();
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 2
        expect(screen.getByText("2/4")).toBeTruthy();
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));

        //question 3
        expect(screen.getByText("3/4")).toBeTruthy();
        await fireEvent.press(screen.getByText("0 days"));
        await fireEvent.press(screen.getByRole("button", {name : "Record"}));

        //question 4
        expect(screen.getByText("4/4")).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));
        expect(screen.getByText("My Management Summary")).toBeTruthy();
        expect(screen.getByText("This helps guide your treatment and support your recovery.")).toBeTruthy();
        expect(screen.getByText("My Management")).toBeTruthy();

        //questions
        expect(screen.getByText("Over the past week, select medications that you consumed to manage your pain.")).toBeTruthy();
        expect(screen.getByText("Over the past week, did you take any over-the-counter (OTC) medication?")).toBeTruthy();
        expect(screen.getByText("In the past 7 days, did you perform any exercises to manage your musculoskeletal pain or improve your movement?")).toBeTruthy();
        expect(screen.getByText("Over the past week, did you perform any strategies to manage your stress level or emotion?")).toBeTruthy();

        //user's answers
        expect(screen.getAllByText('No response')).toBeTruthy();
        expect(screen.getByText("0 days")).toBeTruthy();

        //headings
        expect(screen.getByText("Medication")).toBeTruthy();
        expect(screen.getByText("Exercise")).toBeTruthy();
        expect(screen.getByText("Emotion")).toBeTruthy();
        //message
        expect(screen.getByText("Your answers have been saved.")).toBeTruthy();
        //buttons
        expect(screen.getByText("Edit")).toBeTruthy();
        expect(screen.getByText("Close")).toBeTruthy();
    })
})

// navigation tests
describe("navigation", () => {

    beforeEach(async() => {
        (usePrescriptions as jest.Mock).mockReturnValue({
            list: medications,
        })
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);
    
    test("navigate through all the questions to the summary screen", async() => {
        //navigate through questions 1 - 4
    
        //question 1

        expect(screen.getByText("1/4")).toBeTruthy();
        await fireEvent.press(screen.getByText("Perindopril arginine 5 mg — Once daily"));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 2
        expect(screen.getByText("2/4")).toBeTruthy();
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));

        //question 3
        expect(screen.getByText("3/4")).toBeTruthy();
        await fireEvent.press(screen.getByText("0 days"));
        await fireEvent.press(screen.getByRole("button", {name : "Record"}));

        //question 4
        expect(screen.getByText("4/4")).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        //summary screen
        expect(screen.getByText("My Management Summary")).toBeTruthy();
    })

    test('pressing back on a question (except question 1) should navigate to the previous question', async() => {
        // navigate to question 2 
        await fireEvent.press(screen.getByText("Perindopril arginine 5 mg — Once daily"));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'})); 

        await fireEvent.press(screen.getByText('‹ Back'));
        expect(screen.getByText('1/4')).toBeTruthy();
    })

    test('pressing back on a question 1 should navigate to the homescreen', async() => {
        await fireEvent.press(screen.getByText('‹ Back'));
        expect(onBack).toHaveBeenCalled();
        //homescreen
    })

    test('pressing close on summary screen should navigate to homescreen', async() => {
        //question 1
        expect(screen.getByText("1/4")).toBeTruthy();
        await fireEvent.press(screen.getByText("Perindopril arginine 5 mg — Once daily"));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 2
        expect(screen.getByText("2/4")).toBeTruthy();
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));

        //question 3
        expect(screen.getByText("3/4")).toBeTruthy();
        await fireEvent.press(screen.getByText("0 days"));
        await fireEvent.press(screen.getByRole("button", {name : "Record"}));

        //question 4
        expect(screen.getByText("4/4")).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        //summary screen
        expect(screen.getByText("My Management Summary")).toBeTruthy();

        await fireEvent.press(screen.getByText('Close'));
        expect(onBack).toHaveBeenCalled();        
    })

    test("pressing edit on summary screen should navigate to question 1", async() => {
        //question 1
        expect(screen.getByText("1/4")).toBeTruthy();
        await fireEvent.press(screen.getByText("Perindopril arginine 5 mg — Once daily"));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 2
        expect(screen.getByText("2/4")).toBeTruthy();
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));

        //question 3
        expect(screen.getByText("3/4")).toBeTruthy();
        await fireEvent.press(screen.getByText("0 days"));
        await fireEvent.press(screen.getByRole("button", {name : "Record"}));

        //question 4
        expect(screen.getByText("4/4")).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        //summary screen
        expect(screen.getByText("My Management Summary")).toBeTruthy();

        await fireEvent.press(screen.getByText('Edit'));
        expect(screen.getByText('1/4')).toBeTruthy();
    })
});

//submission tests
describe("submitting users answers to database", () => {

    beforeEach(async() => {
        (usePrescriptions as jest.Mock).mockReturnValue({
            list: medications,
        })
        await render (<AssessmentScreen categoryData={managementQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);

    test("successful submission of the user's answers", async() => {
        const user = userEvent.setup()
    
        //question 1
        expect(screen.getByText("1/4")).toBeTruthy();
        await fireEvent.press(screen.getByText("Perindopril arginine 5 mg — Once daily"));
        await fireEvent.press(screen.getByText("A very long prescription name 80 mg — Once daily"));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 2
        expect(screen.getByText("2/4")).toBeTruthy();
        const otcMedicationInput = screen.getByPlaceholderText("Input name of over the counter medication");
        await user.type(otcMedicationInput, "Panadol");
        await fireEvent.press(screen.getByRole('button', { name : 'Record'}));

        //question 3
        expect(screen.getByText("3/4")).toBeTruthy();
        await fireEvent.press(screen.getByText("1-2 days"));
        await fireEvent.press(screen.getByRole("button", {name : "Record"}));

        //question 4
        expect(screen.getByText("4/4")).toBeTruthy();
        const emotionStrategies = screen.getByPlaceholderText("Write your strategies");
        await user.type(emotionStrategies, "Meditation");
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        await waitFor(() => {
            expect(submitAssessmentAnswers).toHaveBeenCalledWith(
                "My Management",
                {
                    medication: ["Perindopril arginine 5 mg — Once daily", "A very long prescription name 80 mg — Once daily"],
                    otc_medication: "Panadol",
                    exercise_frequency: "1-2 days",
                    emotion_strategies: "Meditation"
                }, 
                {},
                undefined,
            )
        })

        expect(screen.getByText("My Management Summary")).toBeTruthy();
    })

    test("throw an error if submission to the database fails", async() => {
        (submitAssessmentAnswers as jest.Mock).mockRejectedValue(
            new Error('Network error')
        );
        const spyAlert = jest.spyOn(Alert, 'alert');

        // question 1
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 2
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        // Rquestion 3
        await fireEvent.press(screen.getByText('0 days'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByRole('button', {name: 'Review' }));

        await waitFor(() => {
            expect(spyAlert).toHaveBeenCalledWith('Could not save answers','Network error');
        });

        expect(screen.queryByText('My Management Summary')).toBeNull();
    }) 
})