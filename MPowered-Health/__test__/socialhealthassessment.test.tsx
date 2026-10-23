import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AssessmentScreen from '@/components/assessment/assessmentScreen';
import { submitAssessmentAnswers } from '@/hooks/useAssessments';
import { socialHealthQuestions } from '@/constants/assessmentQuestions/socialHealthQuestions';

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
describe("social health assessment questions are rendered on screen", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 9 }}/>);
    });

    afterEach(jest.clearAllMocks);
    
    test("question 1 (Social life) is rendered on screen", () => {
        expect(screen.getByText('Social life')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('My social life is normal and gives me no extra pain')).toBeTruthy();
        expect(screen.getByText('My social life is normal but increases the degree of pain')).toBeTruthy();
        expect(screen.getByText('Pain has no significant effect on my social life apart from limiting my more energetic interests, such as gym or sports')).toBeTruthy();
        expect(screen.getByText('Pain has restricted my social life and I do not go out as often')).toBeTruthy();
        expect(screen.getByText('Pain has restricted my social life to my home')).toBeTruthy();
        expect(screen.getByText('I have no social life because of pain')).toBeTruthy();

        expect(screen.getByText('1/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 2 (Travelling) is rendered on screen", async() => {

        //navigate to question 2
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));        

        expect(screen.getByText('Travelling')).toBeTruthy();
        expect(screen.getByText('Select the MOST relevant statement:')).toBeTruthy();
        // options
        expect(screen.getByText('I can travel anywhere without pain')).toBeTruthy();
        expect(screen.getByText('I can travel anywhere, but it gives me extra pain')).toBeTruthy();
        expect(screen.getByText('Pain is bad, but I manage journeys over two hours')).toBeTruthy();
        expect(screen.getByText('Pain restricts me to journeys of less than one hour')).toBeTruthy();
        expect(screen.getByText('Pain restricts me to short necessary journeys under 30 minutes')).toBeTruthy();
        expect(screen.getByText('Pain prevents me from travelling except to receive treatment')).toBeTruthy();

        expect(screen.getByText('2/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    }); 

    test("question 3 (Mood) is rendered on screen", async() => {
        
        //navigate to question 3
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        expect(screen.getByText('Mood')).toBeTruthy();
        expect(screen.getByText('Over the past week, how much has pain impacted your mood?')).toBeTruthy();
        // score
        expect(screen.getByText('0')).toBeTruthy();
        expect(screen.getByText('10')).toBeTruthy();

        expect(screen.getByText('3/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 4 (Relation with others) is rendered on screen", async() => {

        //navigate to question 4
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByText('Relationships with others')).toBeTruthy();
        expect(screen.getByText('Over the past week, how much has pain interfered with your relationships with other people?')).toBeTruthy();
        // score
        expect(screen.getByText('0')).toBeTruthy();
        expect(screen.getByText('10')).toBeTruthy();

        expect(screen.getByText('4/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 5 (Enjoyment of life) is rendered on screen", async() => {

        //navigate to question 5
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByText('Enjoyment of life')).toBeTruthy();
        expect(screen.getByText('Over the past week, how much has pain impacted your ability to enjoy life?')).toBeTruthy();
        // score
        expect(screen.getByText('0')).toBeTruthy();
        expect(screen.getByText('10')).toBeTruthy();

        expect(screen.getByText('5/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 6 (Mood) is rendered on screen", async() => {

        //navigate to question 6
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByText('Mood')).toBeTruthy();
        expect(screen.getByText('Over the past week, how was your mood generally?')).toBeTruthy();
        expect(screen.getByText('Select the option that best describes your mood.')).toBeTruthy();
        // options - to adjust to how it's actually implemented
        expect(screen.getByText('I was feeling frustrated')).toBeTruthy();
        expect(screen.getByText('I was feeling sad')).toBeTruthy();
        expect(screen.getByText('I was feeling okay')).toBeTruthy();
        expect(screen.getByText('I was feeling calm')).toBeTruthy();
        expect(screen.getByText('I was feeling delighted')).toBeTruthy();

        expect(screen.getByText('6/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    });

    test("question 7 (Mood) is rendered on screen", async() => {

        //navigate to question 7
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByText('Mood')).toBeTruthy();
        expect(screen.getByText('What triggered that mood?')).toBeTruthy();
        // text
        expect(screen.getByPlaceholderText('i.e: delays in work due to pain or inability to meet with friends, etc.')).toBeTruthy();

        expect(screen.getByText('7/7')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Review' })).toBeTruthy();
    });

});

// selection + record button tests (combined as similar tests and to avoid duplicates)
// manual tests for sliders
describe("record button tests", () => {

    afterEach(jest.clearAllMocks);

    test("record button is disabled when no option is selected for question 1", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack}/>);
        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();
    })

    test("record button is enabled when an option is selected for question 1", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack}/>);
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();        
    })

    test("record button is disabled when no option is selected for question 2", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack}/>);
        //navigate to question 2
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();        
    })

    test("record button is enabled when an option is selected for question 2", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack}/>);
        //navigate to question 2
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();          
    })

    test("record button is disabled when no option is selected for question 3", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack}/>);
        //navigate to question 3
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' })); 

        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();  
    })

    test("record button is enabled when a value is selected for question 3", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 9 }}/>);
        //navigate to question 3
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' })); 

        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();  
    })

    test("record button is disabled when no option is selected for question 4", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack}/>);
        //navigate to question 4
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();      
    })

    test("record button is enabled when a value is selected for question 4", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 9 }}/>);
        //navigate to question 4
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));        
    
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();      
    })
    
    test("record button is disabled when no option is selected for question 5", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack}/>);
        //navigate to question 5
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));        
    
        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();      
    })

    test("record button is enabled when a value is selected for question 5", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 9 }}/>);
        //navigate to question 5
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));       
    
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();      
    })

    test("record button is disabled when no option is selected for question 6", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 9 }}/>);
        //navigate to question 6
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));       
    
        expect(screen.getByRole("button", {name: "Record"})).toBeDisabled();      
    })

    test("record button is enabled when a value is selected for question 6", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 9 }}/>);
        //navigate to question 6
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        expect(screen.getByRole("button", {name: "Record"})).toBeEnabled();     
    })

    test("review button is enabled when no text is entered for question 7", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 9 }}/>);
        //navigate to question 7
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));     
    
        expect(screen.getByRole("button", {name: "Review"})).toBeEnabled();      
    })

    test("review button is enabled when text is entered for question 7", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 9 }}/>);
        //navigate to question 7
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        const user = userEvent.setup();
        const moodInput = screen.getByPlaceholderText('i.e: delays in work due to pain or inability to meet with friends, etc.');
        await user.type(moodInput, "No friends :( ");

        expect(screen.getByRole("button", {name: "Review"})).toBeEnabled();
    })
})

// input validation tests
describe("input validation for question 7", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("text entered is within the character limit", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 9 }}/>);
        //navigate to question 7
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        const moodInput = screen.getByPlaceholderText('i.e: delays in work due to pain or inability to meet with friends, etc.');
        await fireEvent.changeText(moodInput, "Didnt like the movie I watched. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibu")
        const updatedInput = screen.getByPlaceholderText('i.e: delays in work due to pain or inability to meet with friends, etc.');
        expect(updatedInput.props.value).toHaveLength(500);
    });
});

describe("summary screen tests", () => {
    
    afterEach(jest.clearAllMocks);
    
    test("objects are rendered on screen correctly", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 9 }}/>);
        
        //question 1
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 2
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 3
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 5
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 6
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 7
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        //summary screen components
        expect(screen.getByText('My Social Health Summary')).toBeTruthy();
        expect(screen.getByText("This helps guide your treatment and support your recovery.")).toBeTruthy();
        expect(screen.getByText("My Social Health")).toBeTruthy();

        //headings
        expect(screen.getByText("Social life")).toBeTruthy();
        expect(screen.getByText("Travelling")).toBeTruthy();
        expect(screen.getByText("Mood")).toBeTruthy();
        expect(screen.getByText("Relationships with others")).toBeTruthy();
        expect(screen.getByText("Enjoyment of life")).toBeTruthy();

        //questions
        expect(screen.getByText('Over the past week, how much has pain impacted your mood?')).toBeTruthy();
        expect(screen.getAllByText('Select the MOST relevant statement:')).toBeTruthy();
        expect(screen.getByText('Over the past week, how was your mood generally?')).toBeTruthy();
        expect(screen.getByText('What triggered that mood?')).toBeTruthy();
        expect(screen.getByText('Over the past week, how much has pain interfered with your relationships with other people?')).toBeTruthy();
        expect(screen.getByText('Over the past week, how much has pain impacted your ability to enjoy life?')).toBeTruthy();
       
        //user's answers
        expect(screen.getByText('My social life is normal and gives me no extra pain')).toBeTruthy();
        expect(screen.getByText('I can travel anywhere without pain')).toBeTruthy();
        expect(screen.getByText('3')).toBeTruthy();
        expect(screen.getByText('3')).toBeTruthy();
        expect(screen.getByText('9')).toBeTruthy();
        expect(screen.getByText("I was feeling frustrated")).toBeTruthy();        
        //message
        expect(screen.getByText("Your answers have been saved.")).toBeTruthy();

        //buttons
        expect(screen.getByText("Edit")).toBeTruthy();
        expect(screen.getByText("Close")).toBeTruthy();
    })

    //tests for displaying the appropriate message according to the score
    test("score less than 10", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 2, relation_impact: 2, enjoyment_impact: 2 }}/>);
        
        //question 1
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 2
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 3
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 5
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 6
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 7
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        // expect summary components to be rendered on screen
        expect(screen.getByText('My Social Health Summary')).toBeTruthy();       
        expect(screen.getByText('Your answers indicate that pain does not really impact your social health.')).toBeTruthy();
    })

    test("score less than 19 and more than 10", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 4 }}/>);
        
        //question 1
        await fireEvent.press(screen.getByText('My social life is normal but increases the degree of pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 2
        await fireEvent.press(screen.getByText('I can travel anywhere, but it gives me extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 3
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 5
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 6
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 7
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        // expect summary components to be rendered on screen
        expect(screen.getByText('My Social Health Summary')).toBeTruthy();
        expect(screen.getByText('Your answers indicate that pain mildly impacts your social health.')).toBeTruthy();
    })

    test("score less than 30 and more than 20", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 9 }}/>);
        
        //question 1
        await fireEvent.press(screen.getByText('Pain has no significant effect on my social life apart from limiting my more energetic interests, such as gym or sports'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 2
        await fireEvent.press(screen.getByText('Pain is bad, but I manage journeys over two hours'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 3
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 5
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 6
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 7
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        // expect summary components to be rendered on screen
        expect(screen.getByText('My Social Health Summary')).toBeTruthy();
        expect(screen.getByText('Your answers indicate that pain moderately impacts your social health.')).toBeTruthy();
    })

    test("score more than 30", async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 8, enjoyment_impact: 9 }}/>);
        
        //question 1
        await fireEvent.press(screen.getByText('Pain has restricted my social life and I do not go out as often'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 2
        await fireEvent.press(screen.getByText('Pain restricts me to journeys of less than one hour'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 3
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 5
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 6
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 7
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        // expect summary components to be rendered on screen
        expect(screen.getByText('My Social Health Summary')).toBeTruthy();
        expect(screen.getByText('Your answers indicate that pain significantly impacts your social health.')).toBeTruthy(); 
    })
})

// navigation tests
describe("navigation", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 9 }}/>);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('navigate through all the questions to the summary screen', async() => {
        
        //question 1
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 2
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 3
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 5
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 6
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 7
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        //summary screen
        expect(screen.getByText('My Social Health Summary')).toBeTruthy();
    });

    test('pressing back on a question (except question 1) should navigate to the previous question', async() => {
        //navigate to question 2
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));     

        await fireEvent.press(screen.getByText('‹ Back'));
        expect(screen.getByText('1/7')).toBeTruthy();
    })

    test('pressing back on a question 1 should navigate to the homescreen', async() => {
        await fireEvent.press(screen.getByText('‹ Back'));
        expect(onBack).toHaveBeenCalled();
        //homescreen
    })

    test('pressing close on summary screen should navigate to homescreen', async() => {
        //question 1
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 2
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 3
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 5
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 6
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 7
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        //summary screen
        expect(screen.getByText('My Social Health Summary')).toBeTruthy();

        await fireEvent.press(screen.getByText('Close'));
        expect(onBack).toHaveBeenCalled();
    })

    test("pressing edit on summary screen should navigate to question 1", async() => {
        //question 1
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 2
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 3
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 5
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 6
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 7
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        //summary screen
        expect(screen.getByText('My Social Health Summary')).toBeTruthy();

        await fireEvent.press(screen.getByText('Edit'));
        expect(screen.getByText('1/7')).toBeTruthy();
    })
});

//submission tests
describe("submitting users answers to database", () => {

    beforeEach(async() => {
        await render (<AssessmentScreen categoryData={socialHealthQuestions} onBack={onBack} existingAnswers={{mood_impact: 5, relation_impact: 3, enjoyment_impact: 9 }}/>);
    });

    afterEach(jest.clearAllMocks);

    test("successful submission of the user's answers", async() => {
    
        //question 1
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 2
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 3
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 5
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 6
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 7
        const user = userEvent.setup();
        const moodInput = screen.getByPlaceholderText('i.e: delays in work due to pain or inability to meet with friends, etc.');
        await user.type(moodInput, "No friends :( ");
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        await waitFor(() => {
            expect(submitAssessmentAnswers).toHaveBeenCalledWith({
                categoryTitle: "My Social Health",
                answers: {
                    social_life: "My social life is normal and gives me no extra pain",
                    travelling: "I can travel anywhere without pain",
                    mood_impact: 5,
                    relation_impact: 3,
                    enjoyment_impact: 9,
                    general_mood: "I was feeling frustrated",
                    mood_trigger: "No friends :( ", 
                }
            })
        })

        expect(screen.getByText("My Social Health Summary")).toBeTruthy();
    })

    test("throw an error if submission to the database fails", async() => {
        (submitAssessmentAnswers as jest.Mock).mockRejectedValue(
            new Error('Network error')
        );
        const spyAlert = jest.spyOn(Alert, 'alert');

        //question 1
        await fireEvent.press(screen.getByText('My social life is normal and gives me no extra pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 2
        await fireEvent.press(screen.getByText('I can travel anywhere without pain'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));  

        //question 3
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 4
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 5
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));
        
        //question 6
        await fireEvent.press(screen.getByText('I was feeling frustrated'));
        await fireEvent.press(screen.getByRole('button', { name: 'Record' }));

        //question 7
        const user = userEvent.setup();
        const moodInput = screen.getByPlaceholderText('i.e: delays in work due to pain or inability to meet with friends, etc.');
        await user.type(moodInput, "No friends :( ");
        await fireEvent.press(screen.getByRole("button", {name: "Review"}));

        await waitFor(() => {
            expect(spyAlert).toHaveBeenCalledWith('Could not save answers','Network error');
        });

        expect(screen.queryByText('My Social Health Summary')).toBeNull();
    }) 
})