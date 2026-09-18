# Account UI

`auth-ui.tsx` contains the header, form layout, fields, buttons, and answer choices
shared by sign-in, sign-up, and onboarding. Its styles stay with these components.
The `sectionLabel` prop is the small section label above a page title, such as YOUR PROFILE.

`welcome/styles.ts` styles only the opening splash carousel, including its text,
page dots, and actions. It does not style sign-in or onboarding forms.
`welcome/artwork.tsx` owns the paired screen previews and their frames because
those details belong to the splash artwork alone.

Colours come from `constants/profile/ui.ts`. The loading initial and app icon use
the same green as the Health wordmark. Activation uses the yellow paper
plane in `assets/images/onboarding-launch.png`; it does not use a purple M.
