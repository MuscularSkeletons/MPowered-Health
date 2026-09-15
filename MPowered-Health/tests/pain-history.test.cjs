// This test file checks pain-history storage, grouping, and report behavior.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Build an isolated storage environment so each test can control saved history safely.
function environment(storage = new Map()) {
  // Toggle write failures to check that disk errors never look like successful saves.
  let failWrite = false;
  const cache = new Map();
  const asyncStorage = {
    getItem: async (key) => storage.get(key) ?? null,
    setItem: async (key, value) => { if (failWrite) throw new Error('Storage full'); storage.set(key, value); },
    getAllKeys: async () => [...storage.keys()],
    multiRemove: async (keys) => keys.forEach((key) => storage.delete(key)),
  };
  function load(relative) {
    // Run production TypeScript with an in-memory storage replacement.
    if (cache.has(relative)) return cache.get(relative);
    const exports = {};
    cache.set(relative, exports);
    const source = fs.readFileSync(path.join(__dirname, '../src', relative + '.ts'), 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    vm.runInNewContext(code, { exports, Date, Error, require: (name) => {
      if (name === '@react-native-async-storage/async-storage') return { default: asyncStorage };
      if (name === './pin-credential') return { writePinCredential: async () => {} };
      if (name === './appointments') return { resetAppointments() {} };
      if (name === './profile-options') return {};
      if (name === '@/utils/workflow-validation') return {};
      return load(path.normalize(path.join(path.dirname(relative), name)));
    } });
    return exports;
  }
  return { load, storage, setFailWrite(value) { failWrite = value; } };
}
const answers = (areas, average = 5, worst = 9, mildest = 2) => ({
  0: areas, 1: ['Aching'], 2: ['4'], 3: [String(mildest)], 4: [String(worst)], 5: [String(average)],
});
const date = (day) => new Date(`2026-06-${String(day).padStart(2, '0')}T02:00:00.000Z`);

// Grouping scenarios prove that the full combination, rather than one area, selects records.
test('weeks 1 and 3 share one exact combination; week 2 stays separate', async () => {
  const { load } = environment();
  const history = load('constants/pain-history');
  await history.savePainAssessment(answers(['Back', 'Knee'], 5), date(1));
  await history.savePainAssessment(answers(['Back'], 3), date(8));
  await history.savePainAssessment(answers(['Knee', 'Back'], 7), date(15));
  const groups = history.groupPainHistory(history.getPainHistory());
  assert.equal(groups.length, 2);
  const combined = groups.find((g) => g.label === 'Back, Knee');
  const back = groups.find((g) => g.label === 'Back');
  assert.equal(combined.records.length, 2);
  assert.equal(combined.records[0].completedAt, date(1).toISOString());
  assert.equal(combined.records[1].completedAt, date(15).toISOString());
  assert.equal(back.records.length, 1);
  assert.equal(back.records[0].completedAt, date(8).toISOString());
  assert.equal(combined.records[1].average, 7);
  assert.equal(combined.records[1].worst, 9);
  assert.equal(combined.records[1].mildest, 2);
});

test('each area combination is order-independent and never matches subsets', () => {
  const history = environment().load('constants/pain-history');
  assert.equal(history.painAreaKey(['Knee', 'Back', 'Back']), history.painAreaKey(['Back', 'Knee']));
  assert.notEqual(history.painAreaKey(['Back']), history.painAreaKey(['Back', 'Knee']));
  assert.notEqual(history.painAreaKey(['Upper Back']), history.painAreaKey(['Lower Back']));
});

test('appointment questions use the latest pain areas and intensity scores', () => {
  const { buildAppointmentQuestions } = environment().load('constants/appointments');
  const questions = buildAppointmentQuestions({
    areas: ['Lower Back', 'Neck', 'Knee'],
    current: 0,
    mildest: 2,
    worst: 9,
    average: 7,
  });
  assert.equal(
    questions[0].text,
    'What could be causing pain in my lower back, neck, and knee?',
  );
  assert.ok(questions.some((question) => question.text.includes('average pain last week was 7')));
  assert.ok(questions.some((question) => question.text.includes('ranged from 2 to 9')));
  assert.ok(questions.every((question) => !question.text.includes('past two weeks')));
});

test('appointment questions do not invent assessment values before My Pain is completed', () => {
  const { buildAppointmentQuestions } = environment().load('constants/appointments');
  const questions = buildAppointmentQuestions();
  assert.equal(questions[0].text, 'What could be causing my pain?');
  assert.ok(questions.some((question) => question.text.includes('track about my pain intensity')));
  assert.ok(questions.every((question) => !/\b[0-9]+ out of 10\b/.test(question.text)));
});

// Saved assessments are immutable snapshots even when screens keep editing their drafts.
test('assessment snapshots survive reload and later answer edits', async () => {
  const env = environment();
  const history = env.load('constants/pain-history');
  const draft = answers(['Back', 'Knee'], 6);
  const saving = history.savePainAssessment(draft, date(1));
  draft[0].pop(); draft[5][0] = '10';
  await saving;
  const returned = history.getPainHistory();
  returned[0].areas.pop(); returned[0].answers[5][0] = '1';
  const reloaded = environment(env.storage).load('constants/pain-history');
  await reloaded.loadPainHistory();
  assert.equal(reloaded.getPainHistory()[0].areas.length, 2);
  assert.equal(reloaded.getPainHistory()[0].average, 6);
  assert.equal(reloaded.getPainHistory()[0].answers[5][0], '6');
});

// Write failures preserve prior history and leave the queue ready for another attempt.
test('failed saves do not report success, discard older history, or block retry', async () => {
  const env = environment();
  const history = env.load('constants/pain-history');
  await history.savePainAssessment(answers(['Back']), date(1));
  env.setFailWrite(true);
  await assert.rejects(history.savePainAssessment(answers(['Knee']), date(8)), /Storage full/);
  assert.equal(history.getPainHistory().length, 1);
  env.setFailWrite(false);
  await history.savePainAssessment(answers(['Knee']), date(8));
  assert.equal(history.getPainHistory().length, 2);
});

// Concurrent submissions serialize safely, and zero remains a valid pain score.
test('queued submissions retain both records and zero scores are valid', async () => {
  const history = environment().load('constants/pain-history');
  await Promise.all([
    history.savePainAssessment(answers(['Back'], 0, 0, 0), date(1)),
    history.savePainAssessment(answers(['Knee'], 10, 10, 10), date(8)),
  ]);
  assert.equal(history.getPainHistory().length, 2);
  assert.equal(history.painMetricValue(history.getPainHistory()[0], 'Mildest'), 0);
  assert.equal(history.painMetricValue(history.getPainHistory()[1], 'Worst'), 10);
  await assert.rejects(history.savePainAssessment(answers([], 5)), /Missing pain areas/);
  await assert.rejects(history.savePainAssessment(answers(['Back'], 11)), /Complete all pain/);
});

// Printed reports must follow the selected area group and metric exactly.
test('filtered PDFs contain only selected assessments and use actual metrics', async () => {
  const { load } = environment();
  const history = load('constants/pain-history');
  await history.savePainAssessment(answers(['Back', 'Knee'], 5, 9, 2), date(1));
  await history.savePainAssessment(answers(['Back'], 3, 8, 0), date(8));
  await history.savePainAssessment(answers(['Knee', 'Back'], 7, 10, 1), date(15));
  const groups = history.groupPainHistory(history.getPainHistory());
  const pdf = load('utils/health-records-report');
  const html = pdf.buildHealthRecordsHtml(groups[0].records, groups[0].label, 'Worst');
  assert.ok(html.includes('Back, Knee'));
  assert.ok(html.includes('Latest worst: 10/10'));
  assert.ok(html.includes('1 June 2026') || html.includes('1 Jun 2026'));
  assert.ok(!html.includes('8 June 2026') && !html.includes('8 Jun 2026'));
  const single = pdf.buildHealthRecordsHtml(groups[1].records, 'Back <script>', 'Mildest');
  assert.ok(single.includes('Latest mildest: 0/10'));
  assert.ok(single.includes('Back &lt;script&gt;'));
  assert.ok(!single.includes('NaN') && !single.includes('Infinity'));
});

// Startup reconnects persisted history to the session; deletion clears both copies.
test('account startup restores pain answers and deleting the account removes history', async () => {
  const env = environment();
  const history = env.load('constants/pain-history');
  await history.savePainAssessment(answers(['Back', 'Knee'], 7), date(1));
  env.storage.set('mpowered:profile', '{}');
  const account = env.load('constants/account');
  const session = env.load('constants/assessment-session');
  await account.initializeAccount();
  assert.equal(session.getAssessmentAnswers('pain')[5][0], '7');
  assert.equal(session.getPainRecords()[0].score, 7);
  await account.deleteLocalAccount();
  assert.equal(history.getPainHistory().length, 0);
  assert.equal(session.getPainRecords().length, 0);
  const reload = environment(env.storage).load('constants/pain-history');
  await reload.loadPainHistory();
  assert.equal(reload.getPainHistory().length, 0);
});
