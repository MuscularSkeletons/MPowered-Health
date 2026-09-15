# Working on MPowered Health

This guide explains where code belongs, how to document it, and what to check before opening a pull request. See [ARCHITECTURE.md](ARCHITECTURE.md) for the complete folder map.

## Start the app

Use the application directory, `MPowered-Health/`, for these commands:

```sh
npm ci
npm start
```

Use `npm run web`, `npm run ios`, or `npm run android` for a particular platform. Installation and the normal start commands generate Expo's route files automatically.

## Find the right owner

| Area                | Owns                                                                        |
| ------------------- | --------------------------------------------------------------------------- |
| `src/auth/`         | Welcome, sign-in, Get Started questions, and activation slides              |
| `src/pain-tracker/` | Assessments, their shared question flow, and weekly reflections             |
| `src/my-health/`    | Records, profile summaries, guidance, and prescriptions                     |
| `src/care-planner/` | Appointment planning, saved appointments, answers, and recording controls   |
| `src/settings/`     | Personal details, privacy controls, and account actions                     |
| `src/shared/`       | Account services, health-history contracts, reusable UI, and app navigation |

A product module may import its own files and app-wide shared code. It must not import another product module. A module's own `shared/` folder is for reuse inside that product; it is different from app-wide `src/shared/`.

Feature branches retain the full application. Keep a tab's implementation and its route manifest in the same branch. Coordinate changes to app-wide shared contracts with the other developers.

## Add or change a screen

1. Put the screen under the product area that owns it. Keep its supporting code nearby.
2. Add its source path and public route path to that module's `route-paths.json`.
3. Run `npm run routes` if the development server is already running.
4. Check normal navigation, Back, and direct links to the route.
5. Run the checks below before pushing.

Do not edit the root `app/` directory. It is generated and ignored by Git. Only explicitly registered source files become routes; a file called `screen.tsx` is not automatically a route. Existing route mappings also preserve historical links. Moving a source file should not silently change its public URL.

`_layout.tsx` owns navigation options and the lifetime of shared form providers. Moving a provider changes when draft data is reset, so check forward, back, and fresh-entry behavior whenever changing a layout.

## Keep responsibilities clear

Screens display information and connect user actions to application logic. Components own reusable pieces of presentation. Hooks group stateful behavior. Draft reducers define changes to form data. Repositories own loading and saving. Types describe the data passed between those pieces.

Use functions, typed objects, and composition by default. A class is useful only when it gives an actual benefit; it is not required for good separation of responsibilities.

Merge a small single-use helper into its screen when the helper does not need an independent home. Split code when it has a different responsibility, is reused, or has substantial platform behavior. For example, appointment date handling stays separate because web, iOS, and Android use different controls. Avoid making shared folders a destination for code that belongs to only one screen.

## Write comments for the next developer

Start each handwritten source file with one short comment describing its purpose. Document named functions with a short explanation of what they do. For public functions with non-obvious inputs or effects, explain:

- What each input represents, including units or accepted formats.
- What the result means, including an empty or invalid result.
- Whether the function changes state, writes to storage, or navigates.
- What happens when saving or loading fails.

TypeScript already describes parameter types; comments should explain their meaning instead of repeating those types. Style, data, and type-only files need a purpose comment, not an artificial function. JSON does not support comments: describe route manifests in the architecture guide rather than adding invalid JSON syntax.

Use ordinary words such as “saves,” “checks,” and “returns.” Explain decisions and constraints inside a function: why a save is queued, why an old URL is accepted, or why a copied answer list is needed. Avoid narrating every assignment or repeating the function name. Keep existing useful explanations and update comments whenever the behavior changes.

Do not claim that prototype behavior is a completed service. A successful local email-code step is not evidence that a server verified an email address. A value held in memory is not permanent storage.

## Formatting and naming

Prettier is the formatting authority. Run `npm run format` to apply it and `npm run format:check` to verify it. Use a clear blank line between function declarations and logical sections. Avoid extra blank lines inside short expressions or hand-aligned spacing that conflicts with the formatter.

Use product terms in folder names. Use names such as `saveReflection`, `useAppointmentAnswers`, and `RecordingConsentModal` that reveal the action or role. Keep small private helpers near the function that uses them. Use `import type` for imports that are only TypeScript contracts. Do not add a re-export file unless it creates a useful boundary.

## Understand the current storage behavior

| Data                                        | Current behavior                                                       |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| Profile and pain history                    | Saved locally through AsyncStorage                                     |
| Weekly reflection                           | Saved locally under a key for its week                                 |
| Native PIN credential                       | Saved in the platform's encrypted credential store                     |
| Web PIN credential                          | Uses the browser credential implementation with a salted derived value |
| Appointment records                         | Held in memory by Care Planner                                         |
| Prescription list                           | Held by the mounted prescription provider                              |
| Appointment answer text and recording links | Held by the appointment answer hook while it is mounted                |
| General assessment completion state         | Held in memory; saved pain history is restored during account startup  |

Account deletion uses a marker so interrupted cleanup can be retried. Product modules register their own cleanup callbacks; the shared account service does not import a tab's repository. Do not bypass that boundary when adding a new local store.

## Validate a change

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run check:features
npm run export
```

The feature check compiles modules with the other product modules unavailable. The export command builds iOS, Android, and web bundles. Neither replaces testing interactions on a device or browser.

For changes to workflows, check required fields, optional skips, Back, returning to a draft, starting a fresh visit, duplicate taps, and failed saves. For recording or export changes, check permission denial and platform-specific behavior. Add tests for meaningful behavior changes; avoid tests that only repeat the implementation.

For a documentation-only change, compare the parsed code before and after with comments removed. This helps confirm that formatting and explanations did not change executable code. It does not prove the application has no pre-existing bugs.

## Discuss changes in a draft pull request

Push the branch before opening its draft PR. Describe the user-visible change, the main design decisions, the checks actually run, and any limitations. Keep the PR as a draft while the team discusses it. Use line comments for specific code questions and the PR conversation for broader architecture decisions. Do not merge until the team is ready.
