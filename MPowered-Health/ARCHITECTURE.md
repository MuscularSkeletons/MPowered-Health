# MPowered Health — feature architecture

This second pass organizes both routes and implementation by ownership. Only reusable UI, form primitives, navigation helpers, theme and document IO belong in `shared`.

```text
src/app/
  _layout.tsx                  Application navigation and account boundary
  (auth)/                     Splash, login, onboarding and loading
    _layout.tsx
    onboarding/_layout.tsx
    onboarding/[step].tsx
  (main)/
    _layout.tsx                Four-tab navigation only
    (pain)/                   Dashboard, assessment, reflection
    (health)/                 Health overview, records, profile, guide, prescriptions
    (care)/                   Care planner, appointment draft, saved consultation
    (account)/                Settings, personal details, permissions
  (legacy)/                   Redirects for existing workflow URLs

src/features/
  account/                    Account boundary, profile model, persistence, account screens
  auth/                       Registration state/models/translation, PIN services, auth UI
  appointments/               Named draft model/provider, planning, consultation, audio/consent
  assessment/                 Assessment definitions, state, summaries and controls
  health/                     Record filters, chart, printing and overview
  medications/                Typed medication model, store, editor hook and screens
  pain/                       Dashboard, pain history and feature content
  profile/                    Report model/builders, export actions and screen
  reflection/                 Reflection lifecycle, persistence and screen

src/shared/
  ui/                         Branding and common buttons
  forms/                      Reusable text/choice controls and basic form styling
  navigation/                 Tab visuals, return navigation and stable visit identity
  export/                     Platform-specific HTML printing, sharing and copying
  theme/                      Shared theme
```

Each main feature route group has its own `_layout.tsx`. Parenthesized groups preserve the established dashboard/explore/care/settings URLs. Authentication is outside the tab navigator, eliminating conditional tab hiding. Compatibility redirects preserve previous `/workflow/...` links.

## Responsibility boundaries

- Appointment drafts use named date, doctor, service, questions and custom-question fields. A pure reducer and plan builder define state transitions and conversion to a stored plan. Internal navigation carries visit identity only; personal answers stay in context.
- Planning review is separate from saved consultation review. Saved review delegates answer input, audio controls, recording consent and signature drawing to components and a consultation hook. The screen is now 89 lines, down from 647 at the start of this pass.
- Registration has its own provider and models. Translating numbered registration answers into a profile belongs to authentication; profile shape and validation belong to the account model.
- Prescription state contains typed medication records with stable identities. The editor hook owns a local draft. Save/update/validation live in the medication model, not in display strings or JSX. Storage remains in memory, matching the prototype.
- Health records delegate filtering to a hook, chart rendering to a component and printing to a control/service. The screen is now 195 lines, down from 604.
- Feature-specific styles, product copy, report builders and date-picker UI sit beside their owners. `shared` does not import features.
- Platform document IO accepts title, HTML and text, so it no longer depends on the profile domain.
- Account startup/deletion handling is isolated from tab presentation. Stable visit identity avoids resetting inactive feature drafts when another tab changes search parameters.
- There are no added classes or duplicated feature implementations. Route files are thin entry points or compatibility redirects.

## Validation and limits

Run `npm run typecheck`, `npm run lint`, `npm run format:check` and `npm test`. The test runner covers storage, registration mapping, reducer isolation/skip behavior, route parsing, named appointment drafts and structured medication edits. Native/web export checks use `npx expo export --platform all`.

Storage keys and platform-specific PIN implementations remain unchanged. Appointments/prescriptions retain the existing in-memory persistence behavior. Native recording, signatures, date pickers and share dialogs still need device smoke testing. The prior Expo Doctor run reported 18 patch-version mismatches; dependencies were not upgraded during this refactor. This second pass has not repeated the earlier interactive browser smoke suite.

Completed checks: TypeScript, lint and formatting passed; all 18 tests passed; iOS, Android and web export succeeded; `git diff --check` passed.
