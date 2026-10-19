import { router } from 'expo-router';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { MedicationProvider } from '@/context/prescriptions-context';
import PrescriptionEditor from '@/app/(tabs)/(myhealth)/(prescriptions)/edit';
import Prescriptions from '@/app/(tabs)/(myhealth)/(prescriptions)';
import type { Medication } from '@/types/prescription';

let mockParams: { id?: string } = {};
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@/context/authcontext', () => ({
  useAuth: () => ({ user: { id: 'user-1', name: 'Test Person', birthsex: 'Female', birthyear: 1980,
    formalDiagnosis: false, painConditions: ['Arthritis'], otherCondition: 'Test condition' } }),
}));
jest.mock('@/services/prescriptions.services', () => ({
  listPrescriptions: jest.fn(async () => []),
  createPrescription: jest.fn(async (_userId: string, draft: Omit<Medication, 'id'>) => ({
    ...draft,
    id: 'prescription-1',
  })),
  updatePrescription: jest.fn(async (id: string, draft: Omit<Medication, 'id'>) => ({
    ...draft,
    id,
  })),
  deletePrescription: jest.fn(async () => undefined),
}));

beforeEach(() => { mockParams = {}; jest.clearAllMocks(); });

it('validates, adds, edits and deletes prescriptions within the same tab session', async () => {
  await render(<MedicationProvider><PrescriptionEditor /><Prescriptions /></MedicationProvider>);
  expect(screen.getByText('No prescriptions added yet.')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Save prescription' })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText('Medication name'), 'Test medicine');
  await fireEvent.changeText(screen.getByLabelText('Strength'), '0');
  expect(screen.getByRole('button', { name: 'Save prescription' })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText('Strength'), '5');
  await fireEvent.press(screen.getByRole('button', { name: 'Save prescription' }));
  await waitFor(() => expect(screen.getByText('Test medicine 5 mg — Every day')).toBeTruthy());
  await fireEvent.press(screen.getByRole('button', { name: 'Edit Test medicine 5 mg — Every day' }));
  const destination = jest.mocked(router.push).mock.calls[0][0];
  if (typeof destination === 'string' || typeof destination.params?.id !== 'string') {
    throw new Error('Edit navigation must include the prescription ID');
  }
  mockParams = { id: destination.params.id };
  await screen.rerender(<MedicationProvider><PrescriptionEditor /><Prescriptions /></MedicationProvider>);
  await fireEvent.changeText(screen.getByLabelText('Strength'), '10');
  await fireEvent.press(screen.getByRole('button', { name: 'Save prescription' }));
  await waitFor(() => expect(screen.getByText('Test medicine 10 mg — Every day')).toBeTruthy());
  expect(screen.queryByText('Test medicine 5 mg — Every day')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Delete Test medicine 10 mg — Every day' }));
  await waitFor(() => expect(screen.getByText('No prescriptions added yet.')).toBeTruthy());
});

it('reports stale prescription links instead of creating another entry', async () => {
  mockParams = { id: 'missing' };
  await render(<MedicationProvider><PrescriptionEditor /></MedicationProvider>);
  expect(screen.getByText('This prescription is no longer available.')).toBeTruthy();
});
