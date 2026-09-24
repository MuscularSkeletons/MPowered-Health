import { router } from 'expo-router';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MedicationProvider } from '@/my-health/prescriptions/state/StoreProvider';
import PrescriptionEditor from '@/my-health/prescriptions/editor/screen';
import Prescriptions from '@/my-health/prescriptions/list/screen';
import PainProfile from '@/my-health/pain-profile/screen';

let mockParams: { id?: string } = {};
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@react-native-async-storage/async-storage', () => jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@/context/authcontext', () => ({
  useAuth: () => ({ user: { id: 'user-1', name: 'Test Person', birthsex: 'Female', birthyear: 1980,
    formalDiagnosis: false, painConditions: ['Arthritis'], otherCondition: 'Test condition' } }),
}));
jest.mock('@/my-health/pain-profile/sharing/ExportActions', () => ({ ProfileExportActions: () => null }));

beforeEach(() => { mockParams = {}; jest.clearAllMocks(); });

it('validates, adds, edits and deletes prescriptions within the same tab session', async () => {
  await render(<MedicationProvider><PrescriptionEditor /><Prescriptions /></MedicationProvider>);
  expect(screen.getByText('Prescription list is empty')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Save prescription' })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText('Medication name'), 'Test medicine');
  await fireEvent.changeText(screen.getByLabelText('Strength'), '0');
  expect(screen.getByRole('button', { name: 'Save prescription' })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText('Strength'), '5');
  await fireEvent.press(screen.getByRole('button', { name: 'Save prescription' }));
  expect(screen.getByText('Test medicine 5 mg — Every day')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Edit Test medicine 5 mg — Every day' }));
  const destination = jest.mocked(router.push).mock.calls[0][0];
  if (typeof destination === 'string' || typeof destination.params?.id !== 'string') {
    throw new Error('Edit navigation must include the prescription ID');
  }
  mockParams = { id: destination.params.id };
  await screen.rerender(<MedicationProvider><PrescriptionEditor /><Prescriptions /></MedicationProvider>);
  await fireEvent.changeText(screen.getByLabelText('Strength'), '10');
  await fireEvent.press(screen.getByRole('button', { name: 'Save prescription' }));
  expect(screen.getByText('Test medicine 10 mg — Every day')).toBeTruthy();
  expect(screen.queryByText('Test medicine 5 mg — Every day')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Delete Test medicine 10 mg — Every day' }));
  expect(screen.getByText('Prescription list is empty')).toBeTruthy();
});

it('reports stale prescription links instead of creating another entry', async () => {
  mockParams = { id: 'missing' };
  await render(<MedicationProvider><PrescriptionEditor /></MedicationProvider>);
  expect(screen.getByText('This prescription is no longer available.')).toBeTruthy();
});

it('uses the existing signed-in profile without fabricated assessment results', async () => {
  await render(<PainProfile />);
  expect(screen.getByText('Test Person')).toBeTruthy();
  expect(screen.getByText('1980')).toBeTruthy();
  expect(screen.getByText('No')).toBeTruthy();
  expect(screen.getByText('Arthritis, Test condition')).toBeTruthy();
  expect(screen.getByText('No completed assessments yet')).toBeTruthy();
  expect(screen.getAllByText('Not recorded').length).toBeGreaterThan(0);
});
