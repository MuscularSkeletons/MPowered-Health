//import { PainAssessment } from '../src/app/(tabs)/(assessment)/painassessment';
import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
//import { painQuestions } from "@/constants/assessment/questions";
import { Alert } from 'react-native';
import AssessmentScreen from '@/components/assessment/assessmentScreen';
import { submitAssessmentAnswers } from '@/hooks/useAssessments';
import { painQuestions } from '@/constants/assessmentQuestions/painQuestions';

const mockUser = jest.fn(() => Promise.resolve('mocked user'));
const onBack = jest.fn();

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

jest.mock('@/context/prescriptionsContext', () => ({
    usePrescriptions: jest.fn (() => ({
        list: [],
    })),
}))

jest.mock('@/hooks/useAssessments', () => ({
    submitAssessmentAnswers: jest.fn(),
})) 

// rendering test
describe("pain assessment questions are rendered on screen", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack} existingAnswers={{
            current_pain: 5, 
            mildest_pain: 7,
            worst_pain: 6,
            average_pain: 8
        }}/>);
    });

    afterEach(jest.clearAllMocks);
    
    test("question 1 (pain location) is rendered on screen", () => {
        expect(screen.getByText("My Pain")).toBeTruthy();
        expect(screen.getByText('Pain location')).toBeTruthy();
        expect(screen.getByText('I have had pain in these areas last week.')).toBeTruthy();
        // options
        expect(screen.getByText('Head')).toBeTruthy();
        expect(screen.getByText('Neck')).toBeTruthy();
        expect(screen.getByText('Shoulder')).toBeTruthy();
        expect(screen.getByText('Upper Back')).toBeTruthy();
        expect(screen.getByText('Lower Back')).toBeTruthy();
        expect(screen.getByText('Leg')).toBeTruthy();
        expect(screen.getByText('Hip')).toBeTruthy();
        expect(screen.getByText('Buttock')).toBeTruthy();
        expect(screen.getByText('Knee')).toBeTruthy();
        expect(screen.getByText('Other')).toBeTruthy();

        expect(screen.getByText('1/6')).toBeTruthy();
        expect(screen.getByText("This question is mandatory.")).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 2 (pain characteristics) is rendered on screen", async() => {

        //navigate to question 2
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        expect(screen.getByText('Pain characteristics')).toBeTruthy();
        expect(screen.getByText('For each of the following words, select the adjectives that apply to your pain.')).toBeTruthy();
        // options
        expect(screen.getByText('Aching')).toBeTruthy();
        expect(screen.getByText('Throbbing')).toBeTruthy();
        expect(screen.getByText('Shooting')).toBeTruthy();
        expect(screen.getByText('Stabbing')).toBeTruthy();
        expect(screen.getByText('Gnawing')).toBeTruthy();
        expect(screen.getByText('Sharp')).toBeTruthy();
        expect(screen.getByText('Tender')).toBeTruthy();
        expect(screen.getByText('Burning')).toBeTruthy();
        expect(screen.getByText('Exhausting')).toBeTruthy();
        expect(screen.getByText('Tiring')).toBeTruthy();
        expect(screen.getByText('Penetrating')).toBeTruthy();
        expect(screen.getByText('Nagging')).toBeTruthy();
        expect(screen.getByText('Numb')).toBeTruthy();
        expect(screen.getByText('Miserable')).toBeTruthy();
        expect(screen.getByText('Unbearable')).toBeTruthy();

        expect(screen.getByText('2/6')).toBeTruthy();
        expect(screen.getByText("This question is mandatory.")).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    }); 

    test("question 3 (pain intensity) is rendered on screen", async() => {

        //navigate to question 3
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        expect(screen.getByText('Pain intensity')).toBeTruthy();
        expect(screen.getByText('My current pain is')).toBeTruthy();
        // score
        expect(screen.getByText('0')).toBeTruthy();
        expect(screen.getByText('10')).toBeTruthy();

        expect(screen.getByText('3/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 4 (pain intensity) is rendered on screen", async() => {

        //navigate to question 4
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        expect(screen.getByText('Pain intensity')).toBeTruthy();
        expect(screen.getByText('My mildest pain last week was')).toBeTruthy();
        // score
        expect(screen.getByText('0')).toBeTruthy();
        expect(screen.getByText('10')).toBeTruthy();

        expect(screen.getByText('4/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 5 (pain intensity) is rendered on screen", async() => {

        //navigate to question 5
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        expect(screen.getByText('Pain intensity')).toBeTruthy();
        expect(screen.getByText('My worst pain last week was')).toBeTruthy();
        // score
        expect(screen.getByText('0')).toBeTruthy();
        expect(screen.getByText('10')).toBeTruthy();

        expect(screen.getByText('5/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 6 (pain intensity) is rendered on screen", async() => {

        //navigate to question 6
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        expect(screen.getByText('Pain intensity')).toBeTruthy();
        expect(screen.getByText('My overall average pain last week was')).toBeTruthy();
        // score
        expect(screen.getByText('0')).toBeTruthy();
        expect(screen.getByText('10')).toBeTruthy();

        expect(screen.getByText('6/6')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
    });
});

describe("record button tests", () => {

    afterEach(jest.clearAllMocks);

    test("record button is disabled when no option is selected for question 1", async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack}/>);
        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();
    })

    test("record button is enabled when an option is selected for question 1", async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack}/>);
        await fireEvent.press(screen.getByText('Head'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();        
    })

    test("record button is disabled when no option is selected for question 2", async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack}/>);
        //navigate to question 2
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();        
    })

    test("record button is enabled when an option is selected for question 2", async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack}/>);
        //navigate to question 2
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        await fireEvent.press(screen.getByText('Aching'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();          
    })

    test("record button is disabled when no option is selected for question 3", async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack}/>);
        //navigate to question 3
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();  
    })

    test("record button is enabled when a value is selected for question 3", async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack} existingAnswers={{
            current_pain: 5, 
            mildest_pain: 7,
            worst_pain: 6,
            average_pain: 8
        }}/>);
        //navigate to question 3
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();  
    })

    test("record button is disabled when no option is selected for question 4", async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack}/>);
        //navigate to question 4
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));        
    
        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();      
    })

    test("record button is enabled when a value is selected for question 4", async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack} existingAnswers={{
            current_pain: 5, 
            mildest_pain: 7,
            worst_pain: 6,
            average_pain: 8
        }}/>);
        //navigate to question 4
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));        
    
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();      
    })
    
    test("record button is disabled when no option is selected for question 5", async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack}/>);
        //navigate to question 5
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));        
    
        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();      
    })

    test("record button is enabled when a value is selected for question 5", async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack} existingAnswers={{
            current_pain: 5, 
            mildest_pain: 7,
            worst_pain: 6,
            average_pain: 8
        }}/>);
        //navigate to question 5
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));        
    
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();      
    })

    test("review button is disabled when no option is selected for question 6", async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack} existingAnswers={{
            current_pain: 5, 
            mildest_pain: 7,
            worst_pain: 6
        }}/>);
        //navigate to question 6
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));        
    
        expect(screen.getByRole("button", {name: "Review"})).toBeDisabled();      
    })

    test("record button is enabled when a value is selected for question 6", async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack} existingAnswers={{
            current_pain: 5, 
            mildest_pain: 7,
            worst_pain: 6,
            average_pain: 8
        }}/>);
        //navigate to question 6
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));        
    
        expect(screen.getByRole("button", {name: "Review"})).toBeEnabled();     
    })
})

// selection tests
// test sliders manually
describe("my pain assessment questions are selected/inputted correctly", () => {
    
    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);
    
    test("multiple options can be selected for question 1", async() => {

        await fireEvent.press(screen.getByText("Hip"));
        await fireEvent.press(screen.getByText("Shoulder"));

        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    });

    test("multiple options can be selected for question 2", async() => {

        //navigate to question 2
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        await fireEvent.press(screen.getByText("Throbbing"));
        await fireEvent.press(screen.getByText("Sharp"));

        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    });
});

// input validation tests
describe("input validation for question 1 other", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);

    test("can input text for question 1 option other", async() => {
        fireEvent.press(screen.getByText("Other"));
        const otherInput = screen.getByPlaceholderText("Please specify location (e.g., Wrist, Elbow)");
        const user = userEvent.setup();
        await user.type(otherInput, "Inner thigh");

        expect(otherInput.props.value).toBe("Inner thigh");
    });

    test("other location entered is not the same as a pre-existing option", async() => {
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("Other"));
        const otherInput = screen.getByPlaceholderText("Please specify location (e.g., Wrist, Elbow)");
        const user = userEvent.setup();
        const location = "Shoulder";
        await user.type(otherInput, location);
        fireEvent.press((screen.getByRole('button', { name: 'Record' })));
        expect(Alert.alert).toHaveBeenCalledWith('Location Already Listed', '"' + {location} + 'is already a an option in the list. Please select it from the options above.');
    });

    test("500 character limit for option other in question 1", async() => {
        fireEvent.press(screen.getByText("Other"));
        const otherInput = screen.getByPlaceholderText("Please specify location (e.g., Wrist, Elbow)");
        const location = "Shoulder Shoulder Shoulder Shoulder Shoulder Shoulder Shoulder Shoulder Shoulder Shoulder Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt.";
        await fireEvent.changeText(otherInput, location);
        const updatedInput = screen.getByPlaceholderText("Input name of over the counter medication");
        expect(updatedInput.props.value).toHaveLength(500);
    })
});

describe('summary screen', () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack} existingAnswers={{
            current_pain: 5, 
            mildest_pain: 7,
            worst_pain: 6,
            average_pain: 8
        }}/>);
    });

    afterEach(jest.clearAllMocks);

    test("objects rendered on screen", async() => {
        //question 1
        const user = userEvent.setup();
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press(screen.getByText('Upper Back'));
        await fireEvent.press(screen.getByText('Other'));
        const locationInput = screen.getByPlaceholderText("Please specify location (e.g., Wrist, Elbow)");
        await userEvent.type(locationInput, "Elbow");
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 2
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press(screen.getByText('Gnawing'));
        await fireEvent.press(screen.getByText('Sharp'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 3
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 4
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 5
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 6
        await fireEvent.press(screen.getByRole('button', { name: 'Review' }));

        expect(screen.getByText("My Pain Summary")).toBeTruthy();
        expect(screen.getByText("This helps guide your treatment and support your recovery.")).toBeTruthy();
        expect(screen.getByText("My Pain")).toBeTruthy();

        //questions
        expect(screen.getByText("I have had pain in these areas last week.")).toBeTruthy();
        expect(screen.getByText("For each of the following words, select the adjectives that apply to your pain.")).toBeTruthy();
        expect(screen.getByText("My current pain is")).toBeTruthy();
        expect(screen.getByText("My mildest pain last week was")).toBeTruthy();
        expect(screen.getByText("My worst pain last week was")).toBeTruthy();
        expect(screen.getByText("My overall average pain last week was")).toBeTruthy();

        //user's answers
        expect(screen.getByText('Head')).toBeTruthy();
        expect(screen.getByText('Upper Back')).toBeTruthy();
        expect(screen.getByText('Elbow')).toBeTruthy();
        expect(screen.getByText('Aching')).toBeTruthy();
        expect(screen.getByText('Gnawing')).toBeTruthy();
        expect(screen.getByText('Sharp')).toBeTruthy();
        expect(screen.getByText('5')).toBeTruthy();
        expect(screen.getByText('7')).toBeTruthy();
        expect(screen.getByText('6')).toBeTruthy();
        expect(screen.getByText('8')).toBeTruthy();

        //headings
        expect(screen.getByText("Pain location")).toBeTruthy();
        expect(screen.getByText("Pain characteristics")).toBeTruthy();
        expect(screen.getByText("Pain intensity")).toBeTruthy();

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
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack} existingAnswers={{
            current_pain: 5, 
            mildest_pain: 7,
            worst_pain: 6,
            average_pain: 8
        }}/>);
    });

    afterEach(jest.clearAllMocks);

    test('navigate through all the questions to the summary screen', async() => {
        //question 1
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 2
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 3
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 4
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 5
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 6
        await fireEvent.press(screen.getByRole('button', { name: 'Review' })); 

        //summary screen
        expect(screen.getByText('My Pain Summary')).toBeTruthy();
    });

    test('pressing back on a question (except question 1) should navigate to the previous question', async() => {
        //navigate to question 2
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        await fireEvent.press(screen.getByText('‹ Back'));
        expect(screen.getByText('1/6')).toBeTruthy();
    })

    test('pressing back on a question 1 should navigate to the homescreen', async() => {
        await fireEvent.press(screen.getByText('‹ Back'));
        expect(onBack).toHaveBeenCalled();
        //homescreen
    })

    test('pressing close on summary screen should navigate to homescreen', async() => {
        //question 1
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 2
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 3
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 4
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 5
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 6
        await fireEvent.press(screen.getByRole('button', { name: 'Review' })); 

        //summary screen
        expect(screen.getByText('My Pain Summary')).toBeTruthy();

        await fireEvent.press(screen.getByText('Close'));
        expect(onBack).toHaveBeenCalled();
        
    })

    test("pressing edit on summary screen should navigate to question 1", async() => {
        //question 1
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 2
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 3
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 4
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 5
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 6
        await fireEvent.press(screen.getByRole('button', { name: 'Review' })); 

        //summary screen
        expect(screen.getByText('My Pain Summary')).toBeTruthy();

        await fireEvent.press(screen.getByText('Edit'));
        expect(screen.getByText('1/6')).toBeTruthy();
        
    })
});

//submission tests
describe("submitting users answers to database", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack} existingAnswers={{
            current_pain: 5, 
            mildest_pain: 7,
            worst_pain: 6,
            average_pain: 8
        }}/>);
    });

    afterEach(jest.clearAllMocks);

    test("successful submission of the user's answers", async() => {
    
        //question 1
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press(screen.getByText('Shoulder'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 2
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press(screen.getByText('Throbbing'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 3
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 4
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 5
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 6
        await fireEvent.press(screen.getByRole('button', { name: 'Review' })); 

        await waitFor(() => {
            expect(submitAssessmentAnswers).toHaveBeenCalledWith(
                "My Pain",
                {
                    pain_location: ['Head', 'Shoulder'],
                    pain_characteristics: ['Aching', 'Throbbing'],
                    current_pain: 5,
                    mildest_pain: 7,
                    worst_pain: 6,
                    average_pain: 8,
                }, 
                {},
                undefined,
            )
        })

        expect(screen.getByText("My Pain Summary")).toBeTruthy();
    })

    test("throw an error if submission to the database fails", async() => {
        (submitAssessmentAnswers as jest.Mock).mockRejectedValue(
            new Error('Network error')
        );
        const spyAlert = jest.spyOn(Alert, 'alert');

        //question 1
        await fireEvent.press(screen.getByText('Head'));
        await fireEvent.press(screen.getByText('Shoulder'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 2
        await fireEvent.press(screen.getByText('Aching'));
        await fireEvent.press(screen.getByText('Throbbing'));
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 3
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 4
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 5
        await fireEvent.press((screen.getByRole('button', { name: 'Record' })));

        //question 6
        await fireEvent.press(screen.getByRole('button', { name: 'Review' })); 

        await waitFor(() => {
            expect(spyAlert).toHaveBeenCalledWith('Could not save answers','Network error');
        });

        expect(screen.queryByText('My Pain Summary')).toBeNull();
    }) 
})
