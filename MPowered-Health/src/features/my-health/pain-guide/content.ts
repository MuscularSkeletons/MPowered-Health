import { Step } from '@/features/auth/onboarding/questions/types';
export const tips: { eyebrow: string; steps: Step[] } = {
  eyebrow: 'PAIN GUIDE',
  steps: [
    {
      title: 'Explore self-management tips',
      copy: 'Choose an area to open trusted information from Musculoskeletal Health Australia.',
      options: [
        'Understanding pain',
        'Exercise and movement',
        'Living well with a musculoskeletal condition',
        'Relaxation and emotions',
      ],
    },
  ],
};
