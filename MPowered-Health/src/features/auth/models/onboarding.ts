import { Step } from '@/features/auth/models/registration-step';
import {
  diagnosisOptions,
  painConditions,
  sexOptions,
} from '@/features/profile/models/profile-options';
export const onboarding: { eyebrow: string; steps: Step[] } = {
  eyebrow: '',
  steps: [
    {
      title: 'Your email address',
      copy: 'We will send the four digit verification codes to this email address',
      fields: ['Your email address'],
    },
    {
      title: 'We’re sending the verification code to this email address',
      copy: 'You can resend the codes in two minutes',
      fields: ['Verification code'],
    },
    {
      title: 'Hello 👋🏻',
      copy: 'A few quick questions so we can make things more relevant for you\n\nBy continuing you agree to Mpowered’s Terms and Conditions and Privacy Policy',
      action: 'Continue',
    },
    {
      title: 'Your name',
      copy: 'Your health and wellbeing is uniquely YOU!\n\nBy having your name, we will know how to address you :)',
      fields: ['Type your name'],
    },
    {
      title: 'Your sex',
      copy: 'Research shows that people may experience pain differently depending on their sex.',
      options: sexOptions,
    },
    {
      title: 'Your year of birth',
      copy: 'Research shows that people can feel pain differently depending on their age.',
      fields: ['Year of birth'],
      optional: true,
    },
    {
      title:
        'Do you have a musculoskeletal (for example arthritis, back pain, gout) or chronic pain diagnosis from your doctor?',
      copy: 'No diagnosis? No problem! You know your body and how you feel so being Health MPowered is for you :)',
      options: diagnosisOptions,
    },
    {
      title: 'Tell us about the musculoskeletal or chronic pain you’re experiencing',
      copy: 'You can select multiple conditions',
      options: painConditions,
      multi: true,
      optional: true,
    },
    {
      title: 'Do you have any other conditions?',
      copy: 'Type conditions or symptoms that you know',
      fields: ['Other conditions'],
      optional: true,
    },
    {
      title: 'Set up your PIN',
      copy: 'Choose a 4-digit PIN to log in quickly next time on this device.',
      fields: ['Create PIN'],
      action: 'Continue',
    },
    {
      title: 'Registration complete',
      copy: 'Finally, let’s link this information to your account so the next time you open this app, you can just log in',
      action: 'Get started',
    },
  ],
};
