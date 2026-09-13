# Finding code in MPowered Health

Start with the app section, then the task. A small feature stays flat. When a feature contains several screens or activities, each gets a folder with its own screen and controls. Shared state lives beside those activities in `state/`; components used only by one activity stay with that activity.

## Product sections

`src/features` contains `pain-tracker`, `my-health`, `care-planner`, `settings`, `auth` and `account`. App-wide UI, input primitives, navigation, printing and theme live in `src/shared`.

Pain Tracker contains My Pain, My Movement, My Personal Care, My Social Health, My Management, Reflection and Overview. Settings contains Overview, Personal Details and Privacy Permissions. These small features keep their screen, styles and domain files together.

## Inside larger features

```text
care-planner/appointment-planning/
  details/
    screen.tsx                Date, doctor and service entry
    DateField.tsx
    PractitionerSelect.tsx
  questions/
    screen.tsx
    QuestionPicker.tsx        Suggested/custom question selection
    styles.ts
  review/
    screen.tsx                Review the draft before saving
  state/
    draft.ts                  Named fields, state transitions and plan builder
    DraftProvider.tsx         Shares that draft across the three screens
  usePlanNavigation.ts        Navigation between planning steps
  legacy-params.ts            Reads old appointment links

care-planner/consultation/
  screen.tsx
  answers/                    Answer input and its hook
  recording/                  Recording controls, consent and signature pad

my-health/prescriptions/
  list/                       List screen and its styles
  editor/                     Add/edit screen and its draft hook
  state/                      Medication rules, shared store and sample records

my-health/pain-profile/
  screen.tsx
  styles.ts
  options.ts
  sharing/                    Report formatting and print/share/copy UI

auth/onboarding/
  screen.tsx                  Coordinates the question sequence
  questions/                  Fields, wording, question types and validation
  state/                      Draft rules and provider
  introduction/               Introductory loading pages and their styles
  to-profile.ts               Converts answers to the stored profile

pain-tracker/shared/assessment/
  screen.tsx                  Question flow layout and navigation
  styles.ts
  types.ts                    Shared assessment contracts
  inputs/                     Question input and score slider
  summary/                    Result layout, insight and text formatting
  state/                      Draft transitions, completed answers and flow hook
```

## Naming and merging rules

Use the folder for context: `details/DateField.tsx`, not `AppointmentDateField.tsx`; `state/draft.ts`, not `appointment-draft.ts`. Use names that explain the role, not vague duplicate domain labels. Exported domain types can keep explicit names such as `AppointmentDraft` so imports are understandable elsewhere.

Keep one screen's small static content with that screen. The appointment details screen now owns its copy and practitioner options; the old unused general appointment configuration is removed. The profile export adapter had one consumer, so its small action functions now live with the export UI. Report formatting remains separate because other consumers need it.

Do not merge draft rules with the provider: the former is pure, testable domain behavior, while the latter controls React state lifetime. Do not create a new directory for every small component. Small features remain flat; larger activities are grouped where that makes related files easier to find.

## Routing and responsibility boundaries

`src/app` contains Expo Router entry points, layouts and compatibility redirects. The main tab groups are `(pain-tracker)`, `(my-health)`, `(care-planner)` and `(settings)`, with nested providers/layouts for onboarding, appointment planning and prescriptions. Public URLs stay unchanged by implementation-file moves.

Individual assessment screens supply definitions, summary functions, persistence and presentation to a generic flow. Shared assessment code does not import individual assessments. Pure reducers describe draft transitions; hooks coordinate state and asynchronous work; UI components handle presentation. Pain Tracker's public `session.ts` coordinates resets and `summaries.ts` composes report summaries. Account lifecycle coordination remains separate from Settings screens.

## Checks and limits

Use `npm run typecheck`, `npm run lint`, `npm test`, `npm run format:check` and `npx expo export --platform all`. The 27 tests cover data behavior, workflow edge cases and dependency boundaries. Implementation moves update tests and imports together.

This organization preserves existing UI, routes and behavior. Native recording/sharing/date-picker flows still need device testing. Existing prototype storage and fixed demo copy are unchanged. Dependency upgrades were outside this refactor.
