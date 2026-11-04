
/**
 * Health integration tests
 *
 * Covers the health-data pipeline, pain-history grouping, report generation,
 * account state, and document export.
 *
 * These tests integrate application modules using local fixtures. Supabase
 * fetching and native print/share APIs are mocked at their boundaries.
 *
 * Run all tests in this file:
 * npx jest __test__/integration/health.integration.tests.ts
 */

jest.mock('@/hooks/useAssessments', () => ({
  fetchHealthSnapshot: jest.fn(),
}));

jest.mock('expo-print', () => ({
  printAsync: jest.fn(),
  printToFileAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
  Share: {
    share: jest.fn(),
  },
}));

import {
  buildSnapshot,
  type AssessmentRow,
} from '@/services/assessmentDataMapper';

import {
  clearHealthRecords,
  getLatestAssessments,
  getPainHistory,
  groupPainHistory,
  loadHealthRecords,
  setHealthRecordsAccount,
  type PainAssessmentRecord,
} from '@/services/healthDataHelper';

import { fetchHealthSnapshot } from '@/hooks/useAssessments';
import { buildPainRecordsHtml } from '@/services/painRecordReportPDF';
import { healthProfileReportHtml } from '@/services/healthProfileReportPDF';
import { printHtml, shareDocument } from '@/utils/documentExport';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';

const mockFetchHealthSnapshot =
  fetchHealthSnapshot as jest.MockedFunction<typeof fetchHealthSnapshot>;

/**
 * Creates a pain record fixture for report tests.
 * Overrides let individual tests change scores, dates, or locations.
 */
const makeRecord = (
  overrides: Partial<PainAssessmentRecord> = {},
): PainAssessmentRecord => ({
  id: 'pain-1',
  completedAt: '2026-06-01T10:00:00.000Z',
  areas: ['Back'],
  current: 4,
  mildest: 1,
  worst: 7,
  average: 3,
  answers: {
    locations: ['Back'],
    characteristics: ['Aching'],
  } as any,
  ...overrides,
});

const januaryDay = (day: number) =>
  new Date(Date.UTC(2026, 0, day)).toISOString();

/**
 * Creates an assessment row containing a pain assessment.
 * The parent assessment ID is used as the mapped pain-record ID.
 */
const assessmentRow = (
  id: string,
  date: string,
  average: number,
  locations: string[],
): AssessmentRow =>
  ({
    assessment_id: id,
    date,
    user_id: 'test-user',
    week_start: date.slice(0, 10),
    weekly_reflection: null,
    pain_assessment: {
      pain_assessment_id: `pain-${id}`,
      created_at: date,
      assessment_id: id,
      current_pain: average,
      average_pain: average,
      worst_pain: Math.min(10, average + 2),
      mildest_pain: Math.max(0, average - 2),
      pain_location: locations,
      pain_characteristics: [],
    },
  }) as unknown as AssessmentRow;

/**
 * Four January assessments in ascending chronological order.
 * The mapper is also tested with these rows reversed, as a database query
 * may return the newest assessment first.
 */
const JANUARY_HISTORY: AssessmentRow[] = [
  assessmentRow('jan-1', januaryDay(1), 5, ['Back']),
  assessmentRow('jan-8', januaryDay(8), 6, ['Leg']),
  assessmentRow('jan-15', januaryDay(15), 4, ['Back']),
  assessmentRow('jan-22', januaryDay(22), 5, ['Leg']),
];

/**
 * Creates a longer history with one assessment per week.
 */
const historyOfLength = (length: number): AssessmentRow[] =>
  Array.from({ length }, (_, index) => {
    const date = new Date(Date.UTC(2026, 0, 1 + index * 7));

    return assessmentRow(
      `week-${index + 1}`,
      date.toISOString(),
      (index % 10) + 1,
      ['Back'],
    );
  });
  

// Database-shaped rows -> mapped pain history

describe('Health data pipeline integration', () => {
  /**
   * Verifies that the mapper correctly orders database rows oldest first,
   * even when the input rows arrive newest first.
   */
  it('returns the four January records oldest first', () => {
    const newestFirst = [...JANUARY_HISTORY].reverse();
    const { painRecords } = buildSnapshot(newestFirst);

    expect(painRecords.map((record) => record.id)).toEqual([
      'jan-1',
      'jan-8',
      'jan-15',
      'jan-22',
    ]);

    expect(painRecords.map((record) => record.average)).toEqual([
      5, 6, 4, 5,
    ]);

    expect(painRecords.map((record) => record.areas)).toEqual([
      ['Back'],
      ['Leg'],
      ['Back'],
      ['Leg'],
    ]);
  });

  /**
   * Verifies that the database's pain fields are mapped to the application's
   * PainAssessmentRecord field names and values.
   */
  it('maps pain fields onto the record', () => {
    const [first] = buildSnapshot([JANUARY_HISTORY[0]]).painRecords;

    expect(first).toMatchObject({
      id: 'jan-1',
      completedAt: januaryDay(1),
      areas: ['Back'],
      current: 5,
      average: 5,
      worst: 7,
      mildest: 3,
    });
  });

  /**
   * Verifies that the mapper supports a nested pain assessment returned as
   * either a single object or a one-element array.
   */
  it('accepts the pain child as an object or a one-element array', () => {
    const original = JANUARY_HISTORY[0];

    const asArray = {
      ...original,
      pain_assessment: Array.isArray(original.pain_assessment)
        ? original.pain_assessment
        : [original.pain_assessment],
    } as unknown as AssessmentRow;

    expect(buildSnapshot([asArray]).painRecords).toEqual(
      buildSnapshot([original]).painRecords,
    );
  });

  /**
   * Verifies that assessments without a pain child do not create pain-history
   * records, while other assessments are still mapped.
   */
  it('skips assessments that have no pain row', () => {
    const withoutPain = {
      ...JANUARY_HISTORY[1],
      pain_assessment: null,
    } as unknown as AssessmentRow;

    const rows = [
      JANUARY_HISTORY[0],
      withoutPain,
      JANUARY_HISTORY[2],
      JANUARY_HISTORY[3],
    ];

    expect(buildSnapshot(rows).painRecords.map((record) => record.id)).toEqual([
      'jan-1',
      'jan-15',
      'jan-22',
    ]);
  });

  /**
   * Verifies that an empty database result produces an empty pain history
   * rather than throwing or creating placeholder records.
   */
  it('returns an empty history when there are no assessments', () => {
    expect(buildSnapshot([]).painRecords).toEqual([]);
  });

  /**
   * Verifies that a longer history retains every record, preserves date
   * order, and does not introduce duplicate IDs.
   */
  it('keeps ten records in date order without duplicate IDs', () => {
    const { painRecords } = buildSnapshot(historyOfLength(10));
    const dates = painRecords.map((record) => record.completedAt);

    expect(painRecords).toHaveLength(10);
    expect(new Set(painRecords.map((record) => record.id)).size).toBe(10);
    expect(dates).toEqual([...dates].sort());
  });
});


// Pain-history location grouping

describe('Pain-history location grouping integration', () => {
  const rows = [
    assessmentRow('leg-only', januaryDay(1), 7, ['Leg']),
    assessmentRow('back-only', januaryDay(8), 5, ['Back']),
    assessmentRow('leg-and-knee', januaryDay(15), 6, ['Leg', 'Knee']),
  ];

  const groups = () => groupPainHistory(buildSnapshot(rows).painRecords);

  const idsFor = (label: string) =>
    groups()
      .find((group) => group.label === label)
      ?.records.map((record) => record.id);

  /**
   * Verifies that an assessment affecting multiple locations appears in each
   * matching location group.
   */
  it('places multi-location records in every matching group', () => {
    expect(idsFor('Leg')).toEqual(['leg-only', 'leg-and-knee']);
    expect(idsFor('Knee')).toEqual(['leg-and-knee']);
    expect(idsFor('Back')).toEqual(['back-only']);
  });

  /**
   * Verifies that grouping does not create locations that are absent from
   * every assessment's pain_location data.
   */
  it('does not create groups for unrecorded locations', () => {
    expect(groups().map((group) => group.label)).not.toContain('Neck');
  });
});

// Health records account state and loading
describe('Health records integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearHealthRecords();
    setHealthRecordsAccount('user-1');
  });

  afterEach(() => {
    clearHealthRecords();
  });

  /**
   * Verifies that fetched snapshot data becomes available through the health
   * history getters, including the expected parent assessment IDs and areas.
   */
  it('loads fetched assessments into pain history and latest answers', async () => {
    const rows = [
      {
        assessment_id: 'assessment-older',
        date: '2026-06-01T10:00:00.000Z',
        pain_assessment: {
          pain_assessment_id: 'pain-older',
          pain_location: ['Back'],
          pain_characteristics: ['Aching'],
          current_pain: 3,
          mildest_pain: 1,
          worst_pain: 5,
          average_pain: 2,
        },
      },
      {
        assessment_id: 'assessment-newer',
        date: '2026-06-08T10:00:00.000Z',
        pain_assessment: {
          pain_assessment_id: 'pain-newer',
          pain_location: ['Shoulder'],
          pain_characteristics: ['Sharp'],
          current_pain: 6,
          mildest_pain: 2,
          worst_pain: 8,
          average_pain: 5,
        },
      },
    ];

    // Simulates the data-fetching boundary returning a mapped snapshot.
    mockFetchHealthSnapshot.mockResolvedValue(
      buildSnapshot(rows as any) as Awaited<
        ReturnType<typeof fetchHealthSnapshot>
      >,
    );

    await loadHealthRecords();

    expect(mockFetchHealthSnapshot).toHaveBeenCalledTimes(1);

    const history = getPainHistory();

    expect(history).toHaveLength(2);
    expect(history.map((record) => record.id)).toEqual([
      'assessment-older',
      'assessment-newer',
    ]);
    expect(history[0].areas).toEqual(['Back']);
    expect(history[1].areas).toEqual(['Shoulder']);

    expect(getLatestAssessments().pain).toBeDefined(); // Confirms that the latest assessment answers are exposed to consumers.
  });

  /**
   * Verifies that switching accounts immediately clears the previous
   * account's cached health history and latest answers.
   */
  it('clears the previous account’s data when the account changes', async () => {
    mockFetchHealthSnapshot.mockResolvedValue(
      buildSnapshot([
        {
          assessment_id: 'assessment-1',
          date: '2026-06-08T10:00:00.000Z',
          pain_assessment: {
            pain_assessment_id: 'pain-1',
            pain_location: ['Back'],
            pain_characteristics: ['Aching'],
            current_pain: 4,
            mildest_pain: 1,
            worst_pain: 7,
            average_pain: 3,
          },
        },
      ] as any) as Awaited<ReturnType<typeof fetchHealthSnapshot>>,
    );

    await loadHealthRecords();
    expect(getPainHistory()).toHaveLength(1);

    setHealthRecordsAccount('user-2');

    expect(getPainHistory()).toEqual([]);
    expect(getLatestAssessments()).toEqual({});
  });

  /**
   * Verifies that signed-out users cannot load or access cached health data.
   */
  it('does not expose data after the user signs out', async () => {
    mockFetchHealthSnapshot.mockResolvedValue(
      buildSnapshot([]) as Awaited<ReturnType<typeof fetchHealthSnapshot>>,
    );

    setHealthRecordsAccount('signed-out');
    await loadHealthRecords();

    expect(mockFetchHealthSnapshot).not.toHaveBeenCalled();
    expect(getPainHistory()).toEqual([]);
    expect(getLatestAssessments()).toEqual({});
  });

  /**
   * Verifies that a data-fetching failure is passed back to the caller so
   * the app can handle the error instead of silently treating it as success.
   */
  it('propagates a fetch failure to the caller', async () => {
    mockFetchHealthSnapshot.mockRejectedValue(
      new Error('Unable to fetch assessments'),
    );

    await expect(loadHealthRecords()).rejects.toThrow(
      'Unable to fetch assessments',
    );
  });
});


// Pain report HTML and chart generation

describe('Pain report integration', () => {
  /**
   * Verifies that a report generated from multiple records contains the
   * selected location, recorded scores, dates, and chart markup.
   */
  it('generates a report containing values from multiple pain records', () => {
    const records = [
      makeRecord({
        id: 'pain-1',
        completedAt: '2026-06-01T10:00:00.000Z',
        average: 3,
      }),
      makeRecord({
        id: 'pain-2',
        completedAt: '2026-06-08T10:00:00.000Z',
        average: 6,
      }),
    ];

    const html = buildPainRecordsHtml(records, 'Back', 'Average');

    expect(html).toContain('<svg');
    expect(html).toContain('Back');
    expect(html).toContain('3');
    expect(html).toContain('6');
    expect(html).toContain('2026');
  });

  /**
   * Verifies that a single record history still produces valid chart markup
   * without invalid numeric values.
   */
  it('generates a valid chart for a single record', () => {
    const html = buildPainRecordsHtml(
      [makeRecord({ average: 5 })],
      'Back',
      'Average',
    );

    expect(html).toContain('<svg');
    expect(html).toContain('Back');
    expect(html).toContain('5');
    expect(html).not.toContain('NaN');
    expect(html).not.toContain('undefined');
  });

  /**
   * Verifies that a user-provided location label is escaped before being
   * inserted into the generated HTML.
   */
  it('escapes user-provided area labels in the generated HTML', () => {
    const html = buildPainRecordsHtml(
      [makeRecord()],
      '<script>alert("x")</script>',
      'Average',
    );

    expect(html).not.toContain('<script>alert("x")</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  /**
   * Verifies that selecting Average, Worst, or Mildest uses the corresponding
   * score from the pain record when generating the report.
   */
  it.each([
    ['Average', 3],
    ['Worst', 7],
    ['Mildest', 1],
  ] as const)(
    'uses the %s pain metric when building the report',
    (metric, expectedValue) => {
      const html = buildPainRecordsHtml([makeRecord()], 'Back', metric);

      expect(html).toContain(String(expectedValue));
    },
  );

  /**
   * Verifies that an empty history can still produce report markup and does
   * not introduce invalid chart values.
   */
  it('handles an empty history without invalid chart values', () => {
    const html = buildPainRecordsHtml([], 'Back', 'Average');

    expect(html).toContain('<svg');
    expect(html).toContain('Back');
    expect(html).not.toContain('NaN');
    expect(html).not.toContain('undefined');
  });

  /**
   * Verifies that records produced by the mapper can be passed directly into
   * the report generator without producing broken numeric output.
   */
  it('builds printable report HTML from mapped records', () => {
    const records = buildSnapshot([
      assessmentRow('a', januaryDay(1), 5, ['Back']),
      assessmentRow('b', januaryDay(8), 6, ['Back']),
      assessmentRow('c', januaryDay(15), 7, ['Back']),
    ]).painRecords;

    const html = buildPainRecordsHtml(records, 'Back', 'Average');

    expect(html).toContain('Back');
    expect(html).not.toMatch(/NaN|undefined|Infinity/);
  });

  /**
   * Verifies that the report generator does not throw when the mapped history
   * is empty.
   */
  it('builds a report when there are no records', () => {
    expect(() => buildPainRecordsHtml([], 'Back', 'Average')).not.toThrow();
  });
});


// Health profile report HTML

describe('Health profile report integration', () => {
  /**
   * Verifies that the profile report generator handles an empty report
   * structure without throwing.
   */
  it('builds a profile report with empty sections', () => {
    expect(() =>
      healthProfileReportHtml({ updatedAt: '', sections: [] }),
    ).not.toThrow();
  });
});



// Document printing and sharing

describe('Document export integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Verifies that generated pain report HTML is passed to the print API,
   * connecting report generation to the document-export layer.
   */
  it('passes generated pain-report HTML to the print API', async () => {
    const html = buildPainRecordsHtml([makeRecord()], 'Back', 'Average');

    (Print.printAsync as jest.Mock).mockResolvedValue(undefined);

    await printHtml(html);

    expect(Print.printAsync).toHaveBeenCalledWith({ html });
  });

  /**
   * Verifies the PDF sharing flow when native file sharing is available:
   * HTML is converted to a PDF, then that file is passed to the share API.
   */
  it('creates a PDF and opens the share sheet when sharing is available', async () => {
    const html = buildPainRecordsHtml([makeRecord()], 'Back', 'Average');

    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Print.printToFileAsync as jest.Mock).mockResolvedValue({
      uri: 'file:///mock/pain-report.pdf',
    });
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

    await expect(
      shareDocument({
        title: 'Pain report',
        html,
        text: 'Pain report text',
      }),
    ).resolves.toBe('done');

    expect(Print.printToFileAsync).toHaveBeenCalledWith({ html });
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      'file:///mock/pain-report.pdf',
      expect.objectContaining({
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: 'Share Pain report',
      }),
    );
    expect(Share.share).not.toHaveBeenCalled();
  });

  /**
   * Verifies the fallback flow when native file sharing is unavailable:
   * the app shares the provided plain text instead of generating a PDF.
   */
  it('falls back to sharing plain text when native file sharing is unavailable', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

    await expect(
      shareDocument({
        title: 'Pain report',
        html: '<p>Back pain</p>',
        text: 'Pain report text',
      }),
    ).resolves.toBe('done');

    expect(Share.share).toHaveBeenCalledWith({
      title: 'Pain report',
      message: 'Pain report text',
    });
    expect(Print.printToFileAsync).not.toHaveBeenCalled();
  });

  /**
   * Verifies that unexpected print failures are propagated to the caller,
   * rather than being silently swallowed.
   */
  it('propagates unexpected printing errors', async () => {
    (Print.printAsync as jest.Mock).mockRejectedValue(
      new Error('Printer unavailable'),
    );

    await expect(printHtml('<p>Test</p>')).rejects.toThrow(
      'Printer unavailable',
    );
  });
});
