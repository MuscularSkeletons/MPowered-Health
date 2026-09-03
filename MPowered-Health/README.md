# MPowered Support Person

This branch contains the standalone support-person frontend: upcoming appointments,
appointment details, joining an appointment, archived appointments, and account settings.
The patient frontend lives on `Front-End`.

Shared UI, navigation icons, app branding, and Expo configuration are retained so this
branch runs independently. Patient onboarding, pain assessments, reflections,
prescriptions, and patient appointment planning are not included.

## Run

From `MPowered-Health/`, run `npm ci`, then `npm start` (or `npm run web`).
Run `npm run lint` and `npx tsc --noEmit` to check the source.

## Existing prototype behavior

Appointments are sample data. Joining an appointment and the account actions retain
the existing prototype navigation; this split does not add backend authentication,
invitation verification, or real appointment sharing.
