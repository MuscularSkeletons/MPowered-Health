//import { PainAssessment } from '../src/app/(tabs)/(assessment)/painassessment';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
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

/*
// selection tests
// test sliders manually
describe("my pain assessment questions are selected/inputted correctly", () => {
    
    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);
    
    test("multiple options can be selected for question 1", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");

        fireEvent.press(screen.getByText("Record"));

    });

    test("can input text for question 1 option other", async() => {
        fireEvent.press(screen.getByText("Other"));
        const otherInput = screen.getByPlaceholderText("Input other pain location");
        const user = userEvent.setup();
        await user.type(otherInput, "Inner thigh");
    });

    test("question 2 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    // TODO: check how Q3-6 implemented in assessment
    test("question 3 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });
    
    test("question 4 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 5 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("question 6 not selected", async() => {
        //show an alert if continue is pressed without selecting an option
        jest.spyOn(Alert, "alert");

        fireEvent.press(screen.getByText("Record"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

});

// input validation tests
describe("input validation for question 1 other", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={painQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);

    // question 1 is mandatory
    test("no text is entered for question 1 other", async() => {
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("Other"));

        fireEvent.press(screen.getByText("OK"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please select an option");
    });

    test("other location entered is not the same as a pre-existing option", async() => {
        jest.spyOn(Alert, "alert");
        fireEvent.press(screen.getByText("Other"));
        const otherInput = screen.getByPlaceholderText("Input other pain location");
        const user = userEvent.setup();
        await user.type(otherInput, "Shoulder");
        fireEvent.press(screen.getByText("OK"));
        expect(Alert.alert).toHaveBeenCalledWith("Error", "please input a location that is not already listed as an option");
    });
});
*/

//submission tests

/*
describe('summary screen', () => {
    test("objects rendered on screen", async() => {
        //use dummy data here for checking
    })
})
*/
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
