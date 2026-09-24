# My Health integration

Ported from `origin/Front-End` at `8a39cca77c652fb9487ccb01fce535ed978403df` onto
`my-health` based on `d2c6626a93859f129769a7145dca873a104551f7`.

## Included

- Overview, pain trend, pain profile and assessment summaries.
- Profile print/PDF, native sharing, web sharing and clipboard fallback.
- Health-record chart/history views, pain-area grouping, metric selection and filtered PDF export.
- Prescription list, add, edit, validation, stale-link handling and deletion.
- Pain guide with external information links.
- Only the forms, header/button, report, history, summary and return-navigation dependencies needed by these screens. No new image assets are required.

## Integration choices

The existing `src/app/(tabs)/myhealth.tsx` placeholder is replaced by a nested
`myhealth/` stack. Existing authentication, onboarding, tab styling, settings,
Pain Tracker and Care Planner code stays unchanged. Feature routes remain under
`/(tabs)/myhealth`; cross-tab links point to the existing target tabs.

The pain profile reads the existing Supabase-backed `useAuth` user rather than
introducing Front-End's local account/PIN system. Field labels match the target
profile's birth year and formal-diagnosis boolean. No sample prescriptions,
sample chart points, fixed assessment dates or invented increase claims are shown.

Prescription state lives above the My Health stack so list/editor/overview navigation
preserves it. It resets when the account changes. As in the source implementation,
prescriptions are in memory only and do not survive a full app restart.

Saved pain history uses an account-specific AsyncStorage key. Loading completes
before feature screens mount, restores the latest pain summary, and supports retry
on read errors. Account changes clear session data and invalidate pending loads and
queued saves. Global prototype history is not migrated into a signed-in account.

## Current limits

The target branch's Pain Tracker and Care Planner are placeholders. Their assessment
entry and appointment flows were deliberately not imported. Consequently new pain
assessments cannot yet be entered here, and charts/assessment summaries show empty
states until a producer uses the shared health-record store. Other assessment
summaries remain session-only, as in the source. No backend assessment schema or
prescription persistence was invented for this port.

## Dependencies and verification

Added Expo SDK 57-compatible `expo-print`, `expo-sharing`, and `react-native-svg`,
the sharing config plugin, and their lockfile entries. The lockfile also reconciles
its existing expo-router range with the unchanged package manifest.

Run from the inner `MPowered-Health` directory:

- `npm run test:my-health` — history, isolation, report and platform-export tests.
- `npx jest --watchAll=false --runInBand` — prescription/profile UI and existing auth-routing tests.
- `npx tsc --noEmit` — type checking (start Expo once to refresh generated route types).
- `npm run lint` — one existing unused-variable warning in settings.
- `npx expo export --platform ios --platform android` — native bundle export.

Native bundle exports succeed. Web static export fails in the existing Supabase /
AsyncStorage initialization with `ReferenceError: window is not defined`; the same
failure was reproduced on the untouched target baseline. Native print/share dialogs
and authenticated browser interaction were not manually exercised on a device.
