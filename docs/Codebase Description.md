# Codebase

The codebase can be accessed via GitHub in this repository: <https://github.com/MuscularSkeletons/MPowered-Health>.


To run the app in the development server using the Expo Go app:

1. Install Git and the current [Node.js LTS](https://nodejs.org/en/download) release (which includes npm) if they are not already installed. On macOS, the setup script can install Node.js for you if [Homebrew](https://brew.sh/) is available.
2. Clone the repository and run the setup script from the repository root:

```text
git clone --branch development https://github.com/MuscularSkeletons/MPowered-Health.git
cd MPowered-Health
cp MPowered-Health/.env.example MPowered-Health/.env
# Fill in the team's Supabase URL and publishable key in MPowered-Health/.env.
./setup-and-run.sh
```

1. The script will tell you if the Supabase settings are missing. Keep `.env` out of Git. Expo is installed with the app dependencies, so a global Expo installation is not needed. Once the server starts, scan its QR code with Expo Go on your phone, or use an installed simulator.


To find the Supabase URL and publishable key:

1. The Supabase URL and publishable key can be found from the dashboard if you click ‘Connect’, then choose 'Server' and look under environmental variables.

Click 'Connect'

Click ‘Server’

The relevant .env variables are the first two!

1. Create an .env inside the MPowered-Health folder on the same levels as src folder.

1. Paste the Supabase URL and publishable key into the .env folder. The file should look like: 

```typescript
EXPO_PUBLIC_SUPABASE_URL='YOUR SUPABASE PROJECT URL'
EXPO_PUBLIC_SUPABASE_ANON_KEY='YOUR PUBLISHABLE KEY'
```

1. Ensure the .env file is not committed.


Troubleshooting Tips:

- Run `npx expo-doctor` to diagnose expo issues

## Code Overview

Below is a diagram of the codebase.

\[insert domain model\]

The repository structure is described below:

```
MPowered-Health/
├── __test__/
├── assets/
├── src/
│   ├── app/
│   │   └── (auth)/          // authentication and onboarding
│   │   └── (tabs)/          // core function of app
│   ├── components/          // shared UI components
│   ├── constants/           // shared variables
│   ├── context/             // shared state
│   ├── hooks/               // custom react hooks
│   ├── lib/
│   │   └── supabase/        // database connection
│   ├── navigation/
│   ├── services/            // shared logic
│   ├── types/
│   ├── utils/               // generic helper functions
```

## Login & Onboarding

#### Screens

There are 4 login screens located in the `src/app/(auth)` folder and 8 onboarding screens located in the `src/app/(auth)/(onboarding)` folder. See below the description of each screen:

| **Screen** | **Appearance** | **Description** |
| --- | --- | --- |
| `splashscreen.tsx` |  | First screen the user sees. Introduces the main app functionalities.Has links to the sign in and sign up screen. |
| `login.tsx` |  | Sign in screen. Requires a correct email and password pair to gain access to the main app. |
| `signup.tsx` |  | Sign up screen. Requires email and password. |
| `activation.tsx` |  | Transition screen between account creation onboarding and seeing the main app for the first time. Displayed for 5000ms. |
| `onboarding.tsx` |  | Once user created via sign up screen, this screen is displayed as an introduction to onboarding where personal details can be gathered.Has external links to MHA’s terms & services and privacy policy. |
| `name.tsx` |  | This screen displays the field for users to enter their name or nickname. Whitespace is removed. |
| `birthsex.tsx` |  | This screen displays the field for users to select their birth sex. |
| `birthyear.tsx` |  | This screen displays the field for users to enter the date of birth. Valid range of years is defined in the `src/constants/profile/profileConstants.ts` file.This field can be skipped. |
| `diagnosis.tsx` |  | This screen displays the field for users to select the status of their chronic pain diagnosis. |
| `conditions.tsx` |  | This screen displays the field for users to select all conditions that apply to them.This field can be skipped. |
| `miscconditions.tsx` |  | This screen displays the field for users to enter any other conditions they may have.This field can be skipped. |
| `completed.tsx` |  | Final onboarding screen. Clicking finish setup uploads user’s profile information to Supabase database and displays the activation screen. |

The general file layout for login and onboarding is specified in the `_layout.tsx` in the `(auth)` folder and the layout for onboarding is in the `_layout.tsx` in the `(auth)/(onboarding)` folder 

#### Used Components & Constants

Login and onboarding uses components from the `shared` folder and constants from the `profile` and `ui` folders. Constants are used to maintain consistency of health information related options and authentication related error messages between onboarding and settings.

#### Backend Integration

Login and onboarding is connected to the database using functions specified in the `authcontext.tsx` folder. Listed below are the key functions it makes use of:

| **Function(s)** | **Use** | **Notes** |
| --- | --- | --- |
| `updateUser``updateUserDraft` | Used in the `completed.tsx` screen to create user profile information from onboarding. |  |
| `signIn` | Used in sign-in page to log user in using email and password verification. |  |
| `signUp` | Creates a new user using an email and password. | Email verification currently unimplemented. |

## Assessment

#### **Screens**

There is 1 assessment screen located in the `src/app/(tabs)/(assessment)` folder. See below the description for the screen:

| **Screen** | **Appearance** | **Description** |
| --- | --- | --- |
| `src/app/(tabs)/(assessment)/index.tsx` |  | This is the dashboard the user will see every time they open the app. |

The file layout is specified in the `_layout.tsx` in the `(assessment)` folder.

#### Components

Assessments uses `common` components from the `shared` folder. Listed below are the key components assessment uses from the `assessment` folder:

|  |  |  |
| --- | --- | --- |
| **Component** | **Appearance** | **Description** |
| `src/components/assessment` `/assessmentScreen.tsx` | Refer to `assessmentQuestion` or `assessmentSummary` for the appearance. | Manages client-side component state (such as step navigation, user input validation, and holding answer data in React state) before sending API requests to the backend server. |
| `src/components/assessment` `/assessmentQuestion.tsx` | Single-selection questionMulti-selection questionSlider score questionText entry question | Renders the user interface (buttons, input fields, progress bar, score sliders) using React Native components to display question cards, options, and input controls to the user. |
| `src/components/assessment` `/assessmentSummary.tsx` |  | Displays the final response overview once an assessment is completed. It displays organised answer and questions into logical sections, period timestamps, and provides options to edit the answers. |
| `src/components/assessment` `/weeklyReflection.tsx` |  | This screen is for user to record their additional reflection on their weekly progress. |
| `src/components/assessment` `/slider.tsx` |  | This is a custom 0-10 numeric rating slider built with React Native’s `PanResponder`. |

**Constants**

Assessments uses constants from the `assessmentQuestion` folder.

|  |  |
| --- | --- |
| **Constants** | **Description** |
| `src/constants/` `assessmentQuestions/` `/assessmentQuestions.ts` | Representative component renders dynamic question option cards, multi-select lists, and input controls based on active question data. |
| `src/constants/` `assessmentQuestions/` `/managementQuestions.ts` | Defines questions for tracking medication, exercise, and mood. |
| `src/constants/` `assessmentQuestions/` `/movementQuestions.ts` | Defines questions for tracking mobility impacts (e.g. walking, lifting, sitting, standing, and daily physical activity limits). |
| `src/constants/` `assessmentQuestions/` `/painQuestions.ts` | Defines questions for tracking pain intensity, location, and severity over the past week. |
| `src/constants/` `assessmentQuestions/` `/personalCareQuestions.ts` | Define questions and rating scales for tracking pain impact on daily living activities, self care routines (washing, dressing), and sleeping. |
| `src/constants/` `assessmentQuestions/` `/socialHealthQuestions.ts` | Defines questions and scales for tracking well-being, mood, relationships, social activities, and travel constraints. |

#### Backend Integration

Assessment is connected to the database using functions specified in the `src/hooks/useAssessments.tsx`. Listed below are the key functions it makes use of:

| **Function(s)** | **Use** | **Notes** |
| --- | --- | --- |
| `getCurrentWeekStartDate()` | Calculates the Monday starting date (YYY-MM-DD) for the current calendar week. | This is used for grouping all assessment responses and reflections into weekly records. |
| `getAuthenticatedUserId()` | Retrieves and validates the currently logged-in Supabase user’s unique ID (`user.id`) | Internal helper that throws an error if the user session has expired or unauthenticated. |
| `getWeeklyAssessmentStreak()` | Calculates the consecutive number of weeks the user has completed at least one assessment. |  |
| `getCurrentWeeklyAssessmentState()` | Loads saved assessment answers and completed section titles for the current week. |  |
| `getOrCreateCurrentWeeklyAssessmentState()` | Fetches the active `assessment_id` for the current week. | Prevent duplicate weekly records for a single user. |
| `submitAssessmentAnswers()` | Inserts user category responses into their respetive Supabase tables |  |
| `saveWeeklyReflection()` | Inserts reflection notes to Supabase table |  |
| `getWeeklyReflection()` | Retrieves the saved reflection text for the current active week. |  |
| `fetchHealthSnapshot()` | Fetches historical assessment records within the data retention window. |  |

## My Health

My Health lets users review their pain history, see a summary of their health profile, export reports as PDFs, and manage their prescriptions. Screens that show an assessment result use the data collected by the Assessment feature. Health assessment data and prescriptions are retrieved from Supabase and restricted to the authenticated user's account through Row Level Security (RLS).

#### Screens

There are five screens located in the `src/app/(tabs)/(myhealth)` folder. See below the description of each screen:

| **Screen** | **Appearance** | **Description** |
| --- | --- | --- |
| `index.tsx` |  | My Health dashboard:Displays the five most recent pain assessments as an average pain trend, alongside the total number of pain records. Provides shortcuts to My Health Profile and My Prescriptions, as well as a link to view all pain records. If no pain records are available, an empty-state message prompts the user to complete a pain assessment. |
| `painrecords.tsx` |  | Pain Records:Allows users to view their pain history through Chart and History tabs. Users can filter records by pain area and, in the Chart tab, switch between Average, Worst and Mildest pain measurements. The chart is accompanied by a table showing the recorded date and all three pain scores. The table initially displays the four most recent records, with an option to expand the list. The History tab displays records in reverse chronological order. Users can print a PDF report for the selected pain area. If no records are available, users can navigate to the Pain Tracker. |
| `healthprofile.tsx` |  | My Health Profile: Displays the latest recorded answers across the five assessment categories: My Pain, My Movement, My Personal Care, My Social Health and My Management. Each category displays its latest assessment date and recorded answers. If a category has no assessment, an empty state message is displayed. The screen also shows the most recent overall update date and provides options to print the profile as a PDF or share its summary. |
| `(prescriptions)/index.tsx` |  | Prescriptions List:Displays the user's saved prescriptions, ordered from oldest to newest. Users can add a new prescription, edit an existing one or delete it. If prescriptions cannot be loaded, an error message and Retry option are displayed. If the list is empty, an empty-state message is shown. |
| `(prescriptions)/edit.tsx` |  | Add/Edit Prescription:Uses the same screen for creating and editing prescriptions. The form collects medication name, strength, strength unit, form, repeat interval and unit of time. Required values are validated before saving. Duplicate prescriptions with the same name, strength and unit are prevented. If an existing prescription is no longer available, the screen displays a message and provides navigation back to the prescriptions list. |

The layout for my health is specified in the `_layout.tsx` in the `src/app/(tabs)/(myhealth)/` folder, and the layout for prescriptions is specified in the `_layout.tsx` in the `src/app/(tabs)/(myhealth)/(prescriptions)/` folder.

#### Used Components & Constants

My Health uses components from the shared folder, such as headers, buttons and form fields, and constants from the `myhealth` and `ui` folders. The dashboard's `PainTrend` chart is defined within `index.tsx` rather than as a separate reusable component. It uses React Native `View` elements to draw the trend. The following components support the My Health and Prescriptions screens.

| **Component File** | **Use** |
| --- | --- |
| `healthDataBoundary.tsx` | Loads health records and prescriptions when the My Health section is opened. Displays a loading indicator while data is retrieved and an error screen with a Retry option if health to record loading fails. Clears cached health data and prescriptions when the boundary unmounts or the account changes. |
| `trackingChart.tsx` | Renders the detailed pain history chart using `react-native-svg`. Displays a 0 to 10 scale, gridlines, data points and a connected trend line for the selected pain metric. |
| `printPainRecordPDFButton.tsx` | Provides the Print PDF button for Pain Records. Builds a report using the selected pain area, pain metric and matching records, then opens the print dialogue. Displays an error message if the report cannot be opened. |
| `healthProfileExportActions.tsx` | Provides the print and share actions for My Health Profile. On web, sharing displays a text summary that users can copy. |
| `form.tsx` | Provides reusable prescription form components, including the `PrescriptionScreen` layout, labelled input fields (`Field`) and selection fields (`SelectField`). |
| `prescriptionsContext.tsx` | Manages the prescription list and its state across the list and editor screens. Handles loading, retrying, adding, editing and deleting prescriptions, and prevents duplicate entries. |
| `common.tsx` | Contains shared UI components used throughout the application. |
| `modal.tsx` | Provides reusable modal functionality for the application. |

#### Services & Helpers

The following services and helper files handle data retrieval, transformation, validation and report generation.

| **File** | **Use** |
| --- | --- |
| `useAssessments.tsx` | Handles assessment operations with Supabase, including retrieving current weekly progress, calculating weekly assessment streaks, creating weekly assessment records, submitting category answers and saving weekly reflections. Also retrieves the health snapshot used by My Health. |
| `healthDataHelper.ts` | Manages the in use memory health record cache for the active account. Provides pain history, latest assessment answers, pain to area grouping, pain metric selection and date formatting. |
| `assessmentDataMapper.ts` | Converts assessment records retrieved from Supabase into the `HealthSnapshot` structure used by My Health. Also provides the data retention cutoff calculation. |
| `prescriptionHelper.ts` | Provides prescription defaults, input validation, prescription readiness checks, display formatting and list updating helpers. |
| `usePrescriptions.ts` | Contains the Supabase CRUD operations for prescriptions, including listing, creating, updating and deleting records. Converts database rows into the app's prescription format and checks for duplicates. |
| `healthProfileReportPDF.ts` | Generates the printable HTML and plain text versions of the My Health Profile report, including all five assessment categories. |
| `painRecordReportPDF.ts` | Generates a printable HTML report for the selected pain area, including a pain trend chart and a table of recorded assessments. |
| `documentExport.ts` | Provides shared document export utilities, including HTML escaping, printing and document sharing. |

#### Backend Integration 

##### 1. Health Assessment Data

Health assessment data is stored in Supabase across the parent `assessment` table and five associated category tables:`pain_assessment, movement_assessment, personal_care_assessment, social_health_assessment, and management_assessment` Each assessment belongs to a user and is associated with a weekly assessment record.

The My Health feature retrieves assessment records using `fetchHealthSnapshot()` in `useAssessments.tsx`. The query:

- Filters records by the authenticated user's ID.
- Retrieves records within the 18-month retention period.
- Orders records by date, newest first.
- Retrieves associated records from all five assessment-category tables in the same query.
- Limits the result to `MAX_ASSESSMENTS`.

The retrieved data is passed to `buildSnapshot()` in `assessmentDataMapper.ts`, which transforms it into a `HealthSnapshot` containing pain history and the latest answers for each assessment category.

##### 2. Prescription Data

Prescription records are stored in the Supabase `prescription` table.

The application supports the following database operations:

| **Operation** | **Function** | **Description** |
| --- | --- | --- |
| Read | `listPrescriptions()` | Retrieves the authenticated user's prescriptions, ordered by creation date from oldest to newest. |
| Create | `createPrescription()` | Inserts a new prescription into the database. |
| Update | `updatePrescription()` | Updates an existing prescription using its ID. |
| Delete | `deletePrescription()` | Deletes a prescription using its ID. |

Each prescription stores: Medication name, Strength, Strength unit, Form, Frequency, and Number of repeats. Before saving, the application checks that required fields are valid and prevents duplicate prescriptions. A duplicate is identified by matching the medication name (case insensitive), numerical strength and strength unit.

##### 3. Row Level Security (RLS)

RLS policies restrict authenticated users to accessing and modifying their own records.

For the `user`, `assessment` and `prescription` tables, ownership is checked using the associated `user_id`. For the five assessment category tables, ownership is checked through the associated parent assessment record, ensuring users can only access assessment data belonging to their account.

The `question` and `delete_request` tables also have user-specific RLS policies. The `delete_request` table has select and insert policies rather than update and delete policies.

These database restrictions provide an additional layer of protection beyond the application's own account filtering.

##### 4. Data Retention

The My Health feature retrieves records within the most recent 18 months. A scheduled Supabase database job runs daily at 03:00 and deletes records from the parent `assessment` table that are older than 18 months. The deletion of associated category records depends on the foreign-key `ON DELETE` behaviour configured in the database schema.




## Questions

#### Screens

There are 2 questions screens located in the `src/app/(tabs)/(questions)` folder. See below the description of each screen:

| **Screen** | **Appearance** | **Description** |
| --- | --- | --- |
| `questions.tsx` |  | Main questions screen. What the user sees when they first navigate to the questions tab. Displays the list of questions that users have added to their plan.Has links to the add questions if the user clicks the '+' button. Users can add or update their answers from this screen.Users can also delete question and answer cards from this screen. |
| `addquestion.tsx` |  | Displays a list of questions generated from the user’s pain assessment for that week. If the assessment is not completed, displays a list of default questions.Custom questions can be added under the Other section.Multiple questions can be selected and added to the user’s plan. |

The file layout is specified in the `_layout.tsx` in the `(questions)` folder.

#### Used Components & Constants

Settings uses components from the `shared` folder such as modals and constants from the `questions` and `ui` folders.

#### Backend Integration

Settings is connected to the database using functions specified in the `useQuestions.tsx` folder. Listed below are the key functions it makes use of:

| **Function(s)** | **Use** | **Notes** |
| --- | --- | --- |
| `createQuestion` | Used in the add questions screen to generate a list of user questions. |  |
| `retrievePainAssessment` | Used in the add questions screen to generate a list of user questions. Used to determine whether to show the default list of questions or a personalised list of questions.Also used in the questions screen to load the pain assessment answers when transitioning to the add questions screen. | Uses the `getCurrentWeekStartDate`function from `useAssessments`hook. |
| `deleteQuestion` | Used in the questions screen to delete a question card. |  |
| `updateAnswer` | Used in the questions screen to add or update an answer for a question. |  |
| `refreshQuestions` | Used in the questions screen to reload the list of questions when the user refreshes the screen. This is in case updated changes in the backend do not reflect in the UI. |  |

## Settings

#### Screens

There are 3 settings screens located in the `src/app/(tabs)/(settings)` folder. See below the description of each screen:

| **Screen** | **Appearance** | **Description** |
| --- | --- | --- |
| `index.tsx` |  | Main settings screen. What the user sees when they first navigate to the settings tab. Has links to the notification and profile screen. Also provides external links to MHA’s terms & services and privacy policy. Users can also update their password from this screen.Also where users can sign out and delete their account. |
| `notifications.tsx` |  | Placeholder screen where notification frequency can be configured. This feature was not implemented due to time constraints. |
| `profile.tsx` |  | Displays user profile information including their personal details, health information and email address. These fields can be updated from this screen. |

The file layout is specified in the `_layout.tsx` in the `(settings)` folder.

#### Used Components & Constants

Settings uses components from the `shared` folder such as modals and constants from the `profile` and `ui` folders. Constants are used to maintain consistency of health information related options and authentication related error messages between onboarding and settings.

#### Backend Integration

Settings is connected to the database using functions specified in the `authcontext.tsx` folder. Listed below are the key functions it makes use of:

| **Function(s)** | **Use** | **Notes** |
| --- | --- | --- |
| `updateUser``updateUserDraft` | Used in the profile screen to update user profile information (the same as the profile information created during onboarding). |  |
| `deleteUser` | Used in the main settings screen to sign the user out and add the user ID to a `delete_request` table. | Automated deletion is currently unimplemented. |
| `signOut` | Used in the main settings screen to sign the user out. |  |
| `updateAuthUserEmail` | Used in the profile screen to update the user’s email. |  |
| `updateAuthUserPassword` | Used in the main settings screen to update the user’s password. Requires the current password in order to update the new password. | For maximum security, secure password change should be enabled (from the Supabase project dashboard, navigate to ‘Authentication’ → ‘Sign In/Providers’, then scroll down to ‘Auth Providers’ and click ‘Email’, then toggle 'Secure password change' on). This requires users to re-verify their email before their password can be updated. The `updateAuthUserPassword` function will also need to be altered. See [this page](https://supabase.com/docs/guides/auth/password-security#require-reauthentication-when-changing-password) for further details. Secure password change was left unimplemented as a custom SMTP service was not set up. |
