import AssessmentScreen from '@/components/assessment/assessmentScreen';
import { personalCareQuestions } from '@/constants/assessmentQuestions/personalCareQuestions';
import { submitAssessmentAnswers } from '@/hooks/useAssessments';
import { fireEvent, render, screen, userEvent , waitFor} from '@testing-library/react-native';
import { Alert } from 'react-native';

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

// rendering test + some navigation
describe("personal care assessment questions are rendered on screen", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={personalCareQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);
    
    test("question 1 (General Activities Impacts) is rendered on screen", async() => {
        expect(screen.getByText('General Activities Impacts')).toBeTruthy();
        expect(screen.getByText("My Personal Care")).toBeTruthy();
        expect(screen.getByText("‹ Back")).toBeTruthy();
        expect(screen.getByText('Select ALL relevant statements:')).toBeTruthy();
        // options
        expect(screen.getByText('I am not doing any jobs that I usually do around the house')).toBeTruthy();
        expect(screen.getByText('I get dressed more slowly than usual because of my pain')).toBeTruthy();
        expect(screen.getByText('I sleep less well because of my pain')).toBeTruthy();
        expect(screen.getByText('I am more irritable and bad tempered with people than usual')).toBeTruthy();
        expect(screen.getByText('I try to get other people to do things for me because of my pain')).toBeTruthy();

        expect(screen.getByText('1/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 2 (Personal care) is rendered on screen", async() => {

        //navigate to question 2
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        expect(screen.getByText('Personal care (washing, dressing, etc.)')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('I can look after myself normally without causing extra pain')).toBeTruthy();
        expect(screen.getByText('I can look after myself normally, but it causes extra pain')).toBeTruthy();
        expect(screen.getByText('It is painful to look after myself and I am slow and careful')).toBeTruthy();
        expect(screen.getByText('I need some help but manage most of my personal care')).toBeTruthy();
        expect(screen.getByText('I need help every day with most aspects of self-care')).toBeTruthy();
        expect(screen.getByText('I do not get dressed, wash with difficulty and stay in bed')).toBeTruthy();
        
        expect(screen.getByText('2/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 3 (Sleeping) is rendered on screen", async() => {
        
        //navigate to question 3
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        expect(screen.getByText('Sleeping')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('My sleep is never disturbed by pain')).toBeTruthy();
        expect(screen.getByText('My sleep is occasionally disturbed by pain')).toBeTruthy();
        expect(screen.getByText('Because of pain I have less than 6 hours of sleep')).toBeTruthy();
        expect(screen.getByText('Because of pain I have less than 4 hours of sleep')).toBeTruthy();
        expect(screen.getByText('Because of pain I have less than 2 hours of sleep')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from sleeping at all')).toBeTruthy();

        expect(screen.getByText('3/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 4 (Reflection) is rendered on screen", async() => {

        //navigate to question 4
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
        await fireEvent.press(screen.getByText('My sleep is never disturbed by pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        expect(screen.getByText('Reflection on your personal care')).toBeTruthy();
        expect(screen.getByText('Write any reflections of pain impacts on your daily life.')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('Write your reflection')).toBeTruthy();

        expect(screen.getByText("For instance, you may have felt unable to complete everyday tasks, such as doing the laundry.")).toBeTruthy();
        expect(screen.getByText('4/4')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
    });

});

// selection + record button tests (combined as similar tests and to avoid duplicates)
describe("my personal care assessment questions are selected/inputted correctly", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={personalCareQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);

    test("record button is disabled when no option is selected for question 1", async() => {
        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();
    });

    test("record button is enabled when an option is selected for question 1", async() => {
        await fireEvent.press(screen.getByText('I get dressed more slowly than usual because of my pain'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    });

    test("record button is enabled when multiple options are selected for question 1", async() => {

        await fireEvent.press(screen.getByText('I get dressed more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByText('I sleep less well because of my pain'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    })

    test("record button is disabled when no option is selected for question 2", async() => {
        //navigate to question 2
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();
    });

    test("record button is enabled when an option is selected for question 2", async() => {
        //navigate to question 2
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        await fireEvent.press(screen.getByText('It is painful to look after myself and I am slow and careful'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    });

    test("record button is disabled when no option is selected for question 3", async() => {
        //navigate to question 3
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();
    });

    test("record button is enabled when an option is selected for question 3", async() => {
        //navigate to question 3
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        await fireEvent.press(screen.getByText('My sleep is never disturbed by pain'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();
    });

    test("record button is enabled when no text is entered for question 4", async() => {
        //navigate to question 4
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
        await fireEvent.press(screen.getByText('My sleep is never disturbed by pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
    
        expect(screen.getByRole("button", {name: "Review"})).toBeEnabled();      
    })

    test("record button is enabled when text is entered for question 4", async() => {
        //navigate to question 4
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
        await fireEvent.press(screen.getByText('My sleep is never disturbed by pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        const reflectionInput = screen.getByPlaceholderText("Write your reflection");
        const user = userEvent.setup();
        await user.type(reflectionInput, "I felt hopeless and unmotivated to do anything this week.");

        expect(reflectionInput.props.value).toBe("I felt hopeless and unmotivated to do anything this week.");
        expect(screen.getByRole("button", {name: "Review"})).toBeEnabled();      
    })
});

// input validation tests testing the 500 character limit
describe("input validation for question 4", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("text entered is within the character limit", async() => {
        await render (<AssessmentScreen categoryData={personalCareQuestions} onBack={onBack}/>);
        //navigate to question 4
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));
        await fireEvent.press(screen.getByText('My sleep is never disturbed by pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        const reflectionInput = screen.getByPlaceholderText("Write your reflection");
        fireEvent.changeText(reflectionInput, "I felt hopeless and unmotivated to do anything this week. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibu")
        const updatedInput = screen.getByPlaceholderText('Write your reflection');
        expect(updatedInput.props.value).toHaveLength(500);
    });
});

describe("summary screen tests", () => {
    
    afterEach(jest.clearAllMocks);
    
    test("objects are rendered on screen correctly", async() => {
        await render (<AssessmentScreen categoryData={personalCareQuestions} onBack={onBack} existingAnswers={{
            activities_impact: 'I am not doing any jobs that I usually do around the house',
            personal_care_impact: 'I can look after myself normally without causing extra pain',
            sleeping_impact: 'My sleep is never disturbed by pain',
            care_reflection: "I felt hopeless and unmotivated to do anything this week.",
        }}/>);
        
        //question 1 
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 2
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 3
        await fireEvent.press(screen.getByText('My sleep is never disturbed by pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 4 (reflection)
        await fireEvent.press(screen.getByRole('button', {name: 'Review'}));

        // expect summary components to be rendered on screen
        expect(screen.getByText('My Personal Care Summary')).toBeTruthy();        expect(screen.getByText("This helps guide your treatment and support your recovery.")).toBeTruthy();
        expect(screen.getByText("My Personal Care")).toBeTruthy();

        //headings
        expect(screen.getByText("General Activities Impacts")).toBeTruthy();
        expect(screen.getByText("Personal care (washing, dressing, etc.)")).toBeTruthy();
        expect(screen.getByText("Sleeping")).toBeTruthy();
        expect(screen.getByText("Reflection on your personal care")).toBeTruthy();

        //questions
        expect(screen.getByText('Select ALL relevant statements:')).toBeTruthy();
        expect(screen.getAllByText('Select the MOST relevant statement:')).toBeTruthy();
        expect(screen.getByText('Write any reflections of pain impacts on your daily life.')).toBeTruthy();
       
        //user's answers
        expect(screen.getByText('I am not doing any jobs that I usually do around the house')).toBeTruthy();
        expect(screen.getByText('I can look after myself normally without causing extra pain')).toBeTruthy();
        expect(screen.getByText('My sleep is never disturbed by pain')).toBeTruthy();
        expect(screen.getByText("I felt hopeless and unmotivated to do anything this week.")).toBeTruthy();        
        //message
        expect(screen.getByText("Your answers have been saved.")).toBeTruthy();

        //buttons
        expect(screen.getByText("Edit")).toBeTruthy();
        expect(screen.getByText("Close")).toBeTruthy();
    })

    //tests for displaying the appropriate message according to the score
    test("score less than 5", async() => {
        await render (<AssessmentScreen categoryData={personalCareQuestions} onBack={onBack} existingAnswers={{
            activities_impact: 'I am not doing any jobs that I usually do around the house',
            personal_care_impact: 'I can look after myself normally without causing extra pain',
            sleeping_impact: 'My sleep is never disturbed by pain',
            care_reflection: "I felt hopeless and unmotivated to do anything this week.",
        }}/>);
        
        //question 1 
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 2
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 3
        await fireEvent.press(screen.getByText('My sleep is never disturbed by pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 4 (reflection)
        await fireEvent.press(screen.getByRole('button', {name: 'Review'}));

        // expect summary components to be rendered on screen
        expect(screen.getByText('My Personal Care Summary')).toBeTruthy();       
        expect(screen.getByText('Your answers indicate that pain does not really impact your personal care.')).toBeTruthy();
    })

    test("score less than 10 and more than 5", async() => {
            await render (<AssessmentScreen categoryData={personalCareQuestions} onBack={onBack} existingAnswers={{
            activities_impact: 'I get dressed more slowly than usual because of my pain',
            personal_care_impact: 'I can look after myself normally, but it causes extra pain',
            sleeping_impact: 'My sleep is occasionally disturbed by pain',
            care_reflection: "I felt hopeless and unmotivated to do anything this week.",
        }}/>);
        
        //question 1 
        await fireEvent.press(screen.getByText('I get dressed more slowly than usual because of my pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 2
        await fireEvent.press(screen.getByText('I can look after myself normally, but it causes extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 3
        await fireEvent.press(screen.getByText('My sleep is occasionally disturbed by pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 4 (reflection)
        await fireEvent.press(screen.getByRole('button', {name: 'Review'}));

        // expect summary components to be rendered on screen
        expect(screen.getByText('My Personal Care Summary')).toBeTruthy();
        expect(screen.getByText('Your answers indicate that pain mildly impacts your personal care.')).toBeTruthy();
    })

    test("score less than 15 and more than 10", async() => {
            await render (<AssessmentScreen categoryData={personalCareQuestions} onBack={onBack} existingAnswers={{
            activities_impact: 'I sleep less well because of my pain',
            personal_care_impact: 'It is painful to look after myself and I am slow and careful',
            sleeping_impact: 'My sleep than never disturbed by pain',
            care_reflection: "I felt hopeless and unmotivated to do anything this week.",
        }}/>);
        
        //question 1 
        await fireEvent.press(screen.getByText('I sleep less well because of my pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 2
        await fireEvent.press(screen.getByText('It is painful to look after myself and I am slow and careful'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 3
        await fireEvent.press(screen.getByText('My sleep is never disturbed by pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 4 (reflection)
        await fireEvent.press(screen.getByRole('button', {name: 'Review'}));

        // expect summary components to be rendered on screen
        expect(screen.getByText('My Personal Care Summary')).toBeTruthy();
        expect(screen.getByText('Your answers indicate that pain moderately impacts your personal care.')).toBeTruthy();
    })

    test("score more than 15", async() => {
            await render (<AssessmentScreen categoryData={personalCareQuestions} onBack={onBack} existingAnswers={{
            activities_impact: 'I try to get other people to do things for me because of my pain',
            personal_care_impact: 'I do not get dressed, wash with difficulty and stay in bed',
            sleeping_impact: 'Pain prevents me from sleeping at all',
            care_reflection: "I felt hopeless and unmotivated to do anything this week.",
        }}/>);
        
        //question 1 
        await fireEvent.press(screen.getByText('I try to get other people to do things for me because of my pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 2
        await fireEvent.press(screen.getByText('I do not get dressed, wash with difficulty and stay in bed'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 3
        await fireEvent.press(screen.getByText('Pain prevents me from sleeping at all'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 4 (reflection)
        await fireEvent.press(screen.getByRole('button', {name: 'Review'}));

        // expect summary components to be rendered on screen
        expect(screen.getByText('My Personal Care Summary')).toBeTruthy();
        expect(screen.getByText('Your answers indicate that pain significantly impacts your personal care.')).toBeTruthy(); 
    })
})

// navigation tests
describe("navigation", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={personalCareQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);

    test('navigate through all the questions to the summary screen', async() => {

        //question 1 
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 2
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 3
        await fireEvent.press(screen.getByText('My sleep is never disturbed by pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 4 (reflection)
        await fireEvent.press(screen.getByRole('button', {name: 'Review'}));

        // expect summary components to be rendered on screen
        expect(screen.getByText('My Personal Care Summary')).toBeTruthy();
    });

    test('pressing back on a question (except question 1) should navigate to the previous question', async() => {
        // navigate to question 2 
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
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
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 2
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 3
        await fireEvent.press(screen.getByText('My sleep is never disturbed by pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 4 (reflection)
        await fireEvent.press(screen.getByRole('button', {name: 'Review'}));

        // expect summary components to be rendered on screen
        expect(screen.getByText('My Personal Care Summary')).toBeTruthy();

        await fireEvent.press(screen.getByText('Close'));
        expect(onBack).toHaveBeenCalled();
    })

    test("pressing edit on summary screen should navigate to question 1", async() => {

        //question 1 
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 2
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 3
        await fireEvent.press(screen.getByText('My sleep is never disturbed by pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 4 (reflection)
        await fireEvent.press(screen.getByRole('button', {name: 'Review'}));

        // expect summary components to be rendered on screen
        expect(screen.getByText('My Personal Care Summary')).toBeTruthy();

        await fireEvent.press(screen.getByText('Edit'));

        expect(screen.getByText('1/4')).toBeTruthy();
    })
});

//submission tests
describe("submitting users answers to database", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={personalCareQuestions} onBack={onBack}/>);
    });

    afterEach(jest.clearAllMocks);

    test("successful submission of the user's answers", async() => {
    
        //question 1 
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 2
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 3
        await fireEvent.press(screen.getByText('My sleep is never disturbed by pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 4 (reflection)
        await fireEvent.press(screen.getByRole('button', {name: 'Review'}));

        await waitFor(() => {
            expect(submitAssessmentAnswers).toHaveBeenCalledWith(
                "My Personal Care",
                {
                    activities_impact: ['I am not doing any jobs that I usually do around the house' ],
                    personal_care_impact: 'I can look after myself normally without causing extra pain',
                    sleeping_impact: 'My sleep is never disturbed by pain',
                }, 
                {
                care_score: 1,
                impact_level: "Your answers indicate that pain does not really impact your personal care.",
                },
                undefined,
            )
        })

        expect(screen.getByText("My Personal Care Summary")).toBeTruthy();
    })

    test("throw an error if submission to the database fails", async() => {
        (submitAssessmentAnswers as jest.Mock).mockRejectedValue(
            new Error('Network error')
        );
        const spyAlert = jest.spyOn(Alert, 'alert');

        //question 1 
        await fireEvent.press(screen.getByText('I am not doing any jobs that I usually do around the house'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 2
        await fireEvent.press(screen.getByText('I can look after myself normally without causing extra pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 3
        await fireEvent.press(screen.getByText('My sleep is never disturbed by pain'));
        await fireEvent.press(screen.getByRole('button', {name: 'Record'}));

        //question 4 (reflection)
        await fireEvent.press(screen.getByRole('button', {name: 'Review'}));

        await waitFor(() => {
            expect(spyAlert).toHaveBeenCalledWith('Could not save answers','Network error');
        });

        expect(screen.queryByText('My Movement Summary')).toBeNull();
    }) 
})