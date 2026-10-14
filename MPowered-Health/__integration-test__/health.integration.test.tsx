
import React, { useEffect } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Text, Pressable, View } from 'react-native';

import HealthRecords from '@/my-health/health-records/screen';
import PainProfileSummary from '@/my-health/pain-profile/screen';
import {
  profileReportHtml,
  profileReportText,
} from '@/my-health/pain-profile/sharing/report';
import {
  MedicationProvider,
  useMedications,
  loadPrescriptions,
  clearPrescriptions,
} from '@/my-health/prescriptions/state/StoreProvider';
import {
  emptyMedication,
  medicationReady,
  medicationLabel,
  saveMedication,
  validStrength,
  type Medication,
} from '@/my-health/prescriptions/state/model';

import {
  printHtml,
  shareDocument,
  copyText,
} from '@/shared/export/document-export';

import {
  createPrescription,
  deletePrescription,
  listPrescriptions,
  updatePrescription,
} from '@/services/prescriptions.service';

import { getDisplayPainHistory } from '@/shared/health-records/display-history';
import { getAssessmentAnswers, getLatestAssessmentDate } from '@/shared/health-records/session';
import { buildSummary, asSentence } from '@/shared/health-records/summaries';

// MOCKS

jest.mock('expo-router', () => {
  const React = require('react');

  return {
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    },
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(callback, [callback]);
    },
  };
});

jest.mock('@/shared/ui/mha-ui', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  return {
    palette: {
      primary: '#49306B',
      secondary: '#8064A2',
      text: '#292033',
    },
    MhaHeader: () =>
      React.createElement(
        View,
        null,
        React.createElement(Text, null, 'MPOWERED Health'),
      ),
  };
});

jest.mock('@/shared/health-records/display-history', () => ({
  getDisplayPainHistory: jest.fn(),
}));

jest.mock('@/shared/health-records/demo-history', () => ({
  isDemoPainRecord: jest.fn(() => false),
}));

jest.mock('@/shared/health-records/session', () => ({
  getAssessmentAnswers: jest.fn(),
  getLatestAssessmentDate: jest.fn(),
}));

jest.mock('@/shared/health-records/summaries', () => ({
  buildSummary: jest.fn(),
  asSentence: jest.fn((value: string) => value),
}));

jest.mock('@/context/authcontext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/my-health/health-records/PrintPdfButton', () => ({
  PrintPdfButton: () => {
    const React = require('react');
    const { Text, Pressable } = require('react-native');

    return React.createElement(
      Pressable,
      {
        accessibilityRole: 'button',
        onPress: jest.fn(),
      },
      React.createElement(Text, null, 'Print PDF'),
    );
  },
}));

jest.mock('@/shared/export/document-export', () => ({
  printHtml: jest.fn().mockResolvedValue(undefined),
  shareDocument: jest.fn().mockResolvedValue('shared'),
  copyText: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/services/prescriptions.service', () => ({
  listPrescriptions: jest.fn(),
  createPrescription: jest.fn(),
  updatePrescription: jest.fn(),
  deletePrescription: jest.fn(),
}));

// Isolate screen tests from the implementation details of the SVG chart.
jest.mock('@/my-health/health-records/TrackingChart', () => ({
  TrackingChart: ({ metric, records }: { metric: string; records: unknown[] }) => {
    const React = require('react');
    const { Text, View } = require('react-native');

    return React.createElement(
      View,
      null,
      React.createElement(
        Text,
        { accessibilityLabel: 'pain-chart-summary' },
        `${metric} pain chart: ${records.length} records`,
      ),
    );
  },
}));

// FIXTURES

const painHistory = [
  {
    id: 'pain-1',
    date: '2026-10-01',
    average: 4,
    worst: 6,
    mildest: 2,
    area: 'Back',
  },
  {
    id: 'pain-2',
    date: '2026-10-03',
    average: 5,
    worst: 7,
    mildest: 3,
    area: 'Back',
  },
  {
    id: 'pain-3',
    date: '2026-10-05',
    average: 3,
    worst: 5,
    mildest: 1,
    area: 'Back',
  },
  {
    id: 'pain-4',
    date: '2026-10-07',
    average: 6,
    worst: 8,
    mildest: 4,
    area: 'Back',
  },
  {
    id: 'pain-5',
    date: '2026-10-09',
    average: 4,
    worst: 6,
    mildest: 2,
    area: 'Back',
  },
  {
    id: 'pain-6',
    date: '2026-10-11',
    average: 7,
    worst: 9,
    mildest: 5,
    area: 'Leg',
  },
];

const existingPrescription: Medication = {
  id: 'prescription-1',
  name: 'Ibuprofen',
  strength: '200',
  unit: 'mg',
  form: 'Tablet',
  repeat: 'day',
};

const validDraft = {
  name: 'Paracetamol',
  strength: '500',
  unit: 'mg',
  form: 'Tablet',
  repeat: 'day',
};

const { useAuth } = require('@/context/authcontext');

// HELPERS

function PrescriptionStoreProbe() {
  const { list, save, remove, error, duplicateOf } = useMedications();

  return (
    <View>
      <Text testID="prescription-count">{list.length}</Text>
      <Text testID="prescription-names">
        {list.map((item) => item.name).join(', ')}
      </Text>
      <Text testID="prescription-error">{error}</Text>
      <Text testID="duplicate-check">
        {duplicateOf({
          name: 'Ibuprofen',
          strength: '200',
          unit: 'mg',
          form: 'Tablet',
          repeat: 'day',
        })
          ? 'duplicate'
          : 'not-duplicate'}
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => void save(validDraft)}
      >
        <Text>Test create</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => void save({ ...validDraft, name: 'Updated medicine' }, 'prescription-1')}
      >
        <Text>Test update</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => void remove('prescription-1')}
      >
        <Text>Test delete</Text>
      </Pressable>
    </View>
  );
}

// SETUP

beforeEach(() => {
  jest.clearAllMocks();
  clearPrescriptions();

  (getDisplayPainHistory as jest.Mock).mockReturnValue(painHistory);

  (getAssessmentAnswers as jest.Mock).mockReturnValue({});
  (getLatestAssessmentDate as jest.Mock).mockReturnValue('2026-10-11');

  (buildSummary as jest.Mock).mockReturnValue([]);

  useAuth.mockReturnValue({
    user: {
      id: 'user-1',
      name: 'Test User',
      birthsex: 'Female',
      birthyear: 2005,
      formalDiagnosis: true,
      painConditions: ['Back pain'],
      otherCondition: 'Occasional leg pain',
    },
  });

  (listPrescriptions as jest.Mock).mockResolvedValue([]);
  (createPrescription as jest.Mock).mockImplementation(
    async (userId, draft) => ({
      id: 'prescription-new',
      ...draft,
      name: draft.name.trim(),
    }),
  );
  (updatePrescription as jest.Mock).mockImplementation(
    async (id, draft) => ({
      id,
      ...draft,
      name: draft.name.trim(),
    }),
  );
  (deletePrescription as jest.Mock).mockResolvedValue(undefined);
});

// HEALTH RECORDS SCREEN

describe('Health records integration', () => {
  it('renders the health records heading and chart by default', async () => {
    render(<HealthRecords />);

    expect(
      screen.getByText('My health tracking records'),
    ).toBeTruthy();

    expect(
      screen.getByText('Average pain chart: 6 records'),
    ).toBeTruthy();
  });

  it('shows the empty state when there are no pain records', () => {
    (getDisplayPainHistory as jest.Mock).mockReturnValue([]);

    render(<HealthRecords />);

    expect(
      screen.getByText('No pain assessments recorded yet'),
    ).toBeTruthy();

    expect(
      screen.getByText(
        'Records will appear here when pain assessments are available.',
      ),
    ).toBeTruthy();

    expect(screen.getByText('Open Pain Tracker')).toBeTruthy();
  });

  it('switches from the chart tab to history', () => {
    render(<HealthRecords />);

    fireEvent.press(screen.getByRole('tab', { name: 'History' }));

    expect(
      screen.getByText('My Pain · Back'),
    ).toBeTruthy();

    expect(
      screen.getByText(/Average 4\/10 · Worst 6\/10 · Mildest 2\/10/),
    ).toBeTruthy();
  });

  it('changes the selected pain metric', () => {
    render(<HealthRecords />);

    fireEvent.press(screen.getByRole('button', { name: 'Worst' }));

    expect(
      screen.getByText('Worst pain chart: 6 records'),
    ).toBeTruthy();
  });

  it('shows only the four most recent records before expansion', () => {
    render(<HealthRecords />);

    expect(screen.getByText('See more records')).toBeTruthy();

    // The newest four records are shown first
    expect(screen.getByText('2026-10-11')).toBeTruthy();
    expect(screen.getByText('2026-10-09')).toBeTruthy();
    expect(screen.getByText('2026-10-07')).toBeTruthy();
    expect(screen.getByText('2026-10-05')).toBeTruthy();

    // The fifth and sixth newest are hidden from the table.
    expect(screen.queryByText('2026-10-03')).toBeNull();
    expect(screen.queryByText('2026-10-01')).toBeNull();
  });

  it('reveals older records and allows the list to collapse again', () => {
    render(<HealthRecords />);

    fireEvent.press(screen.getByText('See more records'));

    expect(screen.getByText('Show fewer records')).toBeTruthy();
    expect(screen.getByText('2026-10-03')).toBeTruthy();
    expect(screen.getByText('2026-10-01')).toBeTruthy();

    fireEvent.press(screen.getByText('Show fewer records'));

    expect(screen.getByText('See more records')).toBeTruthy();
    expect(screen.queryByText('2026-10-01')).toBeNull();
  });

  it('opens the pain-area selector and displays available groups', () => {
    render(<HealthRecords />);

    fireEvent.press(
      screen.getByRole('button', { name: 'Pain areas: Back' }),
    );

    expect(screen.getByText('Choose pain areas')).toBeTruthy();
    expect(screen.getByText('Back')).toBeTruthy();
    expect(screen.getByText('Leg')).toBeTruthy();
  });

  it('changes the selected pain area', () => {
    render(<HealthRecords />);

    fireEvent.press(
      screen.getByRole('button', { name: 'Pain areas: Back' }),
    );

    fireEvent.press(screen.getByRole('radio', { name: /Leg/ }));

    expect(
      screen.getByText('Average pain chart: 1 records'),
    ).toBeTruthy();

    expect(
      screen.getByRole('button', { name: 'Pain areas: Leg' }),
    ).toBeTruthy();
  });

  it('closes the pain-area selector without changing the selected area', () => {
    render(<HealthRecords />);

    fireEvent.press(
      screen.getByRole('button', { name: 'Pain areas: Back' }),
    );

    fireEvent.press(screen.getByText('Close'));

    expect(
      screen.getByRole('button', { name: 'Pain areas: Back' }),
    ).toBeTruthy();

    expect(screen.queryByText('Choose pain areas')).toBeNull();
  });

  it('disables the pain-area selector when no groups exist', () => {
    (getDisplayPainHistory as jest.Mock).mockReturnValue([]);

    render(<HealthRecords />);

    expect(
      screen.getByRole('button', { name: 'Pain areas: No assessments yet' }).props
        .accessibilityState.disabled,
    ).toBe(true);
  });
});

// PAIN PROFILE SCREEN

describe('Pain profile integration', () => {
  it('renders the user profile and recorded personal information', () => {
    render(<PainProfileSummary />);

    expect(screen.getByText('My Pain Profile')).toBeTruthy();
    expect(screen.getByText('Test User')).toBeTruthy();
    expect(screen.getByText('Female')).toBeTruthy();
    expect(screen.getByText('2005')).toBeTruthy();
    expect(screen.getByText('Yes')).toBeTruthy();
    expect(
      screen.getByText('Back pain, Occasional leg pain'),
    ).toBeTruthy();
  });

  it('shows an unrecorded state when no profile user is available', () => {
    useAuth.mockReturnValue({ user: null });

    render(<PainProfileSummary />);

    expect(screen.getAllByText('Not recorded').length).toBeGreaterThan(0);
  });

  it('shows the latest assessment date when available', () => {
    render(<PainProfileSummary />);

    expect(screen.getByText('Updated 2026-10-11')).toBeTruthy();
  });

  it('disables PDF and share actions when there is no profile', () => {
    useAuth.mockReturnValue({ user: null });

    render(<PainProfileSummary />);

    expect(
      screen.getByRole('button', { name: 'Print My Pain Profile PDF' }).props
        .accessibilityState.disabled,
    ).toBe(true);

    expect(
      screen.getByRole('button', { name: 'Share My Pain Profile' }).props
        .accessibilityState.disabled,
    ).toBe(true);
  });

  it('calls the print helper when Print PDF is pressed', async () => {
    render(<PainProfileSummary />);

    fireEvent.press(
      screen.getByRole('button', { name: 'Print My Pain Profile PDF' }),
    );

    await waitFor(() => {
      expect(printHtml).toHaveBeenCalledTimes(1);
    });

    expect(printHtml).toHaveBeenCalledWith(
      expect.stringContaining('<title>My Pain Profile</title>'),
    );
  });

  it('includes profile headings and values in the plain-text report', () => {
    const report = {
      updatedAt: '2026-10-11',
      sections: [
        {
          title: 'About me',
          subtitle: '',
          items: [
            ['Name', 'Test User'],
            ['Year of birth', '2005'],
          ] as [string, string][],
        },
        {
          title: 'My Pain',
          subtitle: 'Severity and location',
          items: [['Pain location', 'Back']] as [string, string][],
        },
      ],
    };

    const text = profileReportText(report);

    expect(text).toContain('My Pain Profile');
    expect(text).toContain('Updated 2026-10-11');
    expect(text).toContain('About me');
    expect(text).toContain('Name: Test User');
    expect(text).toContain('Pain location: Back');
  });

  it('escapes user-supplied HTML in the printable report', () => {
    const report = {
      updatedAt: '',
      sections: [
        {
          title: '<script>alert("x")</script>',
          subtitle: '',
          items: [
            ['Name', '<img src=x onerror=alert(1)>'],
          ] as [string, string][],
        },
      ],
    };

    const html = profileReportHtml(report);

    expect(html).not.toContain('<script>alert');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img src=x');
  });
});

// PRESCRIPTION MODEL

describe('Prescription model', () => {
  it('creates the expected default medication draft', () => {
    expect(emptyMedication()).toEqual({
      name: '',
      strength: '',
      unit: 'mg',
      form: 'Tablet',
      repeat: 'day',
    });
  });

  it.each([
    ['200', true],
    ['0.5', true],
    ['0', false],
    ['-2', false],
    ['200mg', false],
    ['', false],
    ['abc', false],
  ])('validates strength "%s" as %s', (strength, expected) => {
    expect(validStrength(strength)).toBe(expected);
  });

  it('requires all mandatory fields before saving', () => {
    expect(medicationReady(validDraft)).toBe(true);
    expect(medicationReady({ ...validDraft, name: ' ' })).toBe(false);
    expect(medicationReady({ ...validDraft, strength: '200mg' })).toBe(false);
    expect(medicationReady({ ...validDraft, unit: '' })).toBe(false);
    expect(medicationReady({ ...validDraft, form: '' })).toBe(false);
    expect(medicationReady({ ...validDraft, repeat: '' })).toBe(false);
  });

  it('adds a valid prescription to the list', () => {
    const result = saveMedication([], validDraft, 'p1');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...validDraft,
      name: 'Paracetamol',
      id: 'p1',
    });
  });

  it('trims whitespace from medication names', () => {
    const result = saveMedication(
      [],
      { ...validDraft, name: '  Paracetamol  ' },
      'p1',
    );

    expect(result[0].name).toBe('Paracetamol');
  });

  it('does not modify the list when the draft is invalid', () => {
    const initial: Medication[] = [existingPrescription];

    const result = saveMedication(
      initial,
      { ...validDraft, strength: 'invalid' },
      'p2',
    );

    expect(result).toBe(initial);
    expect(result).toHaveLength(1);
  });

  it('replaces an existing prescription with the same ID', () => {
    const result = saveMedication(
      [existingPrescription],
      { ...validDraft, name: 'Updated medicine' },
      existingPrescription.id,
    );

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Updated medicine');
  });

  it('formats the medication label', () => {
    expect(medicationLabel(existingPrescription)).toBe(
      'Ibuprofen 200 mg — Every day',
    );
  });
});

// PRESCRIPTION STORE / SERVICE INTEGRATION

describe('Prescription store integration', () => {
  it('loads prescriptions for the current user', async () => {
    (listPrescriptions as jest.Mock).mockResolvedValue([
      existingPrescription,
    ]);

    await loadPrescriptions('user-1');

    render(
      <MedicationProvider>
        <PrescriptionStoreProbe />
      </MedicationProvider>,
    );

    expect(screen.getByTestId('prescription-count').props.children).toBe(1);
    expect(
      screen.getByTestId('prescription-names').props.children,
    ).toBe('Ibuprofen');
    expect(listPrescriptions).toHaveBeenCalledWith('user-1');
  });

  it('creates a prescription and updates the store after success', async () => {
    render(
      <MedicationProvider>
        <PrescriptionStoreProbe />
      </MedicationProvider>,
    );

    fireEvent.press(screen.getByText('Test create'));

    await waitFor(() => {
      expect(createPrescription).toHaveBeenCalledWith(
        'user-1',
        validDraft,
      );
      expect(screen.getByTestId('prescription-count').props.children).toBe(1);
    });

    expect(
      screen.getByTestId('prescription-names').props.children,
    ).toBe('Paracetamol');
  });

  it('does not save an invalid draft', async () => {
    render(
      <MedicationProvider>
        <PrescriptionStoreProbe />
      </MedicationProvider>,
    );

    expect(createPrescription).not.toHaveBeenCalled();
  });

  it('updates an existing prescription after the service succeeds', async () => {
    await loadPrescriptions('user-1');
    (listPrescriptions as jest.Mock).mockResolvedValue([existingPrescription]);
    clearPrescriptions();
    await loadPrescriptions('user-1');

    render(
      <MedicationProvider>
        <PrescriptionStoreProbe />
      </MedicationProvider>,
    );

    fireEvent.press(screen.getByText('Test update'));

    await waitFor(() => {
      expect(updatePrescription).toHaveBeenCalledWith(
        'prescription-1',
        expect.objectContaining({ name: 'Updated medicine' }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByTestId('prescription-names').props.children,
      ).toBe('Updated medicine');
    });
  });

  it('removes a prescription after the delete succeeds', async () => {
    (listPrescriptions as jest.Mock).mockResolvedValue([existingPrescription]);
    await loadPrescriptions('user-1');

    render(
      <MedicationProvider>
        <PrescriptionStoreProbe />
      </MedicationProvider>,
    );

    fireEvent.press(screen.getByText('Test delete'));

    await waitFor(() => {
      expect(deletePrescription).toHaveBeenCalledWith('prescription-1');
      expect(screen.getByTestId('prescription-count').props.children).toBe(0);
    });
  });

  it('shows an error and keeps the list unchanged when saving fails', async () => {
    (createPrescription as jest.Mock).mockRejectedValue(
      new Error('Database unavailable'),
    );

    render(
      <MedicationProvider>
        <PrescriptionStoreProbe />
      </MedicationProvider>,
    );

    fireEvent.press(screen.getByText('Test create'));

    await waitFor(() => {
      expect(screen.getByTestId('prescription-error').props.children).toBe(
        'The prescription could not be saved. Please try again.',
      );
    });

    expect(screen.getByTestId('prescription-count').props.children).toBe(0);
  });

  it('reports whether an existing prescription is a duplicate', async () => {
    (listPrescriptions as jest.Mock).mockResolvedValue([existingPrescription]);
    await loadPrescriptions('user-1');

    render(
      <MedicationProvider>
        <PrescriptionStoreProbe />
      </MedicationProvider>,
    );

    expect(screen.getByTestId('duplicate-check').props.children).toBe(
      'duplicate',
    );
  });
});