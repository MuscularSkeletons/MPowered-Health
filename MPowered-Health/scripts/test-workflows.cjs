// This test file checks shared workflow validation and navigation rules.
/* global __dirname */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Load the actual TypeScript helpers without starting Expo. Inject storage in tests
// so a fresh module load can simulate reopening the app without touching real notes.
function load(relativePath, imports = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: false,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      if (name in imports) return imports[name];
      const resolved = name.startsWith('@/')
        ? path.join('src', name.slice(2))
        : name.startsWith('.')
          ? path.join(path.dirname(relativePath), name)
          : null;
      if (resolved) return load(resolved + '.ts', imports);
      throw new Error('Missing test dependency: ' + name);
    },
    Date,
  });
  return exports;
}
const { validAnswer, workflowStep } = load('src/shared/forms/validation.ts');

// Basic workflow input rules protect navigation from incomplete or malformed answers.
test('invalid or stale workflow steps start at the first question', () => {
  for (const value of ['10', '-1', 'NaN', 'Infinity', '1.5']) {
    assert.equal(workflowStep(value, 1), 0);
  }
  assert.equal(workflowStep('6', 11), 6);
});
test('birth year rejects empty, malformed and future answers', () => {
  for (const value of ['', '   ', '99', '1980x', '1899', String(new Date().getFullYear() + 1)]) {
    assert.equal(validAnswer('Year of birth', value), false);
  }
  assert.equal(validAnswer('Year of birth', '1980'), true);
  assert.equal(validAnswer('Other conditions', '  '), false);
  assert.equal(validAnswer('Other conditions', 'Example condition'), true);
});
test('prescription strength must be a finite positive number', () => {
  for (const value of ['', '0', '-1', 'abc', 'Infinity']) {
    assert.equal(validAnswer('Strength', value), false);
  }
  assert.equal(validAnswer('Strength', '2.5'), true);
  assert.equal(validAnswer('Medication name', '  '), false);
});
test('reflections survive a fresh module load and stay separated by week', async () => {
  const stored = new Map();
  const imports = {
    '@react-native-async-storage/async-storage': {
      default: {
        getItem: async (key) => stored.get(key) ?? null,
        setItem: async (key, value) => stored.set(key, value),
      },
    },
  };
  const first = load('src/pain-tracker/reflection/repository.ts', imports);
  assert.equal(first.reflectionWeek(new Date(2026, 8, 6)), '2026-08-31');
  assert.equal(first.reflectionWeek(new Date(2026, 8, 7)), '2026-09-07');
  await first.saveReflection(' First week ', '2026-08-31');
  const reopened = load('src/pain-tracker/reflection/repository.ts', imports);
  assert.equal((await reopened.getReflection('2026-08-31')).notes, 'First week');
  await reopened.saveReflection('Second week', '2026-09-07');
  assert.equal((await reopened.getReflection('2026-08-31')).notes, 'First week');
  await assert.rejects(reopened.saveReflection('   ', '2026-08-31'));
  assert.equal((await reopened.getReflection('2026-08-31')).notes, 'First week');
});
test('storage failures are surfaced instead of reporting a successful save', async () => {
  const reflections = load('src/pain-tracker/reflection/repository.ts', {
    '@react-native-async-storage/async-storage': {
      default: {
        setItem: async () => {
          throw new Error('Storage unavailable');
        },
      },
    },
  });
  await assert.rejects(reflections.saveReflection('Keep my draft'), /Storage unavailable/);
});

// Email entry replaces phone entry; shared validation covers onboarding and login.
test('email requires an address and preserves common address formats', () => {
  for (const value of [
    '',
    '   ',
    '0412345678',
    'alex',
    'alex@',
    '@example.com',
    'alex@example',
    'alex @example.com',
    'alex@@example.com',
    'a'.repeat(250) + '@example.com',
  ]) {
    assert.equal(validAnswer('Your email address', value), false);
  }
  for (const value of [
    'alex@example.com',
    'Alex.Smith+health@example.com.au',
    ' alex@example.com ',
  ]) {
    assert.equal(validAnswer('Your email address', value), true);
  }
});

function accountFixture(initial = []) {
  // Keep storage in memory and count resets so deletion side effects are observable.
  const stored = new Map(initial);
  let resets = 0;
  const storage = {
    getItem: async (key) => stored.get(key) ?? null,
    setItem: async (key, value) => stored.set(key, value),
    removeItem: async (key) => stored.delete(key),
    getAllKeys: async () => [...stored.keys()],
    multiRemove: async (keys) => keys.forEach((key) => stored.delete(key)),
  };
  const imports = {
    '@react-native-async-storage/async-storage': { default: storage },
    '@/shared/forms/validation': { validAnswer },
    '@/shared/account/security/pin-credential': {
      writePinCredential: async () => {},
      readPinCredential: async () => null,
    },
    '@/shared/health-records/pain-history': {
      finishPainHistoryWrites: async () => {},
      loadPainHistory: async () => {},
      getPainHistory: () => [],
    },
    '@/shared/account/profile-options': load('src/shared/account/profile-options.ts'),
    '@/shared/health-records/session': {
      resetAssessmentSession: () => {
        resets++;
      },
    },
  };
  return {
    stored,
    storage,
    load: () => {
      const account = load('src/shared/account/repository.ts', imports);
      account.registerAccountCleanup('test.feature', () => {
        resets++;
      });
      return account;
    },
    resets: () => resets,
  };
}
const sampleProfile = {
  // Reuse one valid profile so each account test focuses on a single behavior.
  email: 'alex@example.com',
  name: 'Alex',
  sex: 'Prefer not to say',
  birthYear: '',
  diagnosis: 'No, I haven’t',
  conditions: [],
  otherConditions: '',
};

// Account scenarios cover persistence, safe updates, deletion, and interrupted cleanup.
test('onboarding profile persists and edits preserve optional answers without saving verification codes', async () => {
  const fixture = accountFixture();
  const account = fixture.load();
  const profile = load('src/auth/get-started/to-profile.ts').profileFromAnswers(
    {
      '0-Your email address': 'alex@example.com',
      '1-Verification code': '1234',
      '3-Type your name': 'Alex',
      '5-Year of birth': '1980',
      '8-Other conditions': 'Example',
    },
    { 4: ['Prefer not to say'], 6: ['No, I haven’t'], 7: ['Back pain'] },
  );
  await account.saveProfile(profile);
  assert.equal(JSON.stringify(await account.getProfile()).includes('1234'), false);
  const reopened = fixture.load();
  assert.equal((await reopened.getProfile()).name, 'Alex');
  await reopened.saveProfile({
    ...profile,
    name: 'Alex Updated',
    birthYear: '',
    conditions: [],
    otherConditions: '',
  });
  const updated = await fixture.load().getProfile();
  assert.equal(updated.name, 'Alex Updated');
  assert.equal(updated.birthYear, '');
  assert.equal(updated.conditions.length, 0);
  await assert.rejects(reopened.saveProfile({ ...profile, email: 'invalid' }));
  assert.equal((await reopened.getProfile()).name, 'Alex Updated');
});
test('account deletion removes app data, preserves unrelated keys, and resets active screens', async () => {
  const fixture = accountFixture([
    ['another-app:key', 'keep'],
    ['mpowered:reflection:2026-08-31', 'notes'],
  ]);
  const account = fixture.load();
  await account.saveProfile(sampleProfile);
  await account.deleteLocalAccount();
  assert.equal(await account.getProfile(), null);
  assert.equal(fixture.stored.has('mpowered:reflection:2026-08-31'), false);
  assert.equal(fixture.stored.get('another-app:key'), 'keep');
  assert.equal(account.getAccountSnapshot().deleted, true);
  assert.equal(account.getAccountSnapshot().revision, 1);
  assert.equal(fixture.resets(), 2);
  const reopened = fixture.load();
  await reopened.initializeAccount();
  assert.equal(reopened.getAccountSnapshot().deleted, true);
  assert.equal(reopened.getAccountSnapshot().demo, false);
  await reopened.saveProfile(sampleProfile);
  assert.equal(reopened.getAccountSnapshot().deleted, false);
});
test('failed deletion remains retryable and initialization completes interrupted cleanup', async () => {
  const fixture = accountFixture([['mpowered:profile', JSON.stringify(sampleProfile)]]);
  const account = fixture.load();
  const remove = fixture.storage.multiRemove;
  fixture.storage.multiRemove = async () => {
    throw new Error('Storage unavailable');
  };
  await assert.rejects(account.deleteLocalAccount(), /Storage unavailable/);
  assert.equal(account.getAccountSnapshot().revision, 0);
  fixture.storage.multiRemove = remove;
  const reopened = fixture.load();
  await reopened.initializeAccount();
  assert.equal(await reopened.getProfile(), null);
  assert.equal(reopened.getAccountSnapshot().deleted, true);
});

const { registrationReducer: draftReducer } = load(
  'src/auth/get-started/form-data/draft.ts',
);
const { isStepReady } = load('src/auth/get-started/questions/validation.ts', {
  '@/shared/forms/validation': { validAnswer },
});
test('shared draft preserves earlier fields and selections across steps', () => {
  const empty = { fields: {}, values: {} };
  let draft = draftReducer(empty, {
    type: 'field',
    key: '0-Your email address',
    value: 'test@example.com',
  });
  draft = draftReducer(draft, { type: 'choice', step: 4, value: 'Female' });
  draft = draftReducer(draft, { type: 'field', key: '3-Type your name', value: 'Test' });
  assert.equal(draft.fields['0-Your email address'], 'test@example.com');
  assert.equal(draft.values[4][0], 'Female');
  assert.equal(Object.keys(empty.fields).length, 0);
});
test('skipping clears only the optional step, including an invalid draft year', () => {
  const draft = {
    fields: { '5-Year of birth': 'invalid', '3-Type your name': 'Test' },
    values: { 4: ['Female'], 5: ['old'] },
  };
  const next = draftReducer(draft, { type: 'skip', step: 5, fields: ['Year of birth'] });
  assert.equal(next.fields['5-Year of birth'], undefined);
  assert.equal(next.fields['3-Type your name'], 'Test');
  assert.equal(next.values[4][0], 'Female');
  assert.equal(next.values[5].length, 0);
  assert.equal(draft.fields['5-Year of birth'], 'invalid');
});
test('multiple choices toggle without affecting other steps', () => {
  let draft = { fields: {}, values: { 0: ['General Practitioner'] } };
  for (const value of ['One', 'Two', 'One'])
    draft = draftReducer(draft, { type: 'choice', step: 1, value, multi: true });
  assert.equal(draft.values[1].join(','), 'Two');
  assert.equal(draft.values[0][0], 'General Practitioner');
});
const { parseQuestions } = load('src/care-planner/appointment-planning/appointment-draft/legacy-link-parser.ts');
test('malformed appointment links cannot crash or inject non-string answers', () => {
  for (const value of [undefined, '{', 'null', '{}', '[1]', '["ok",{}]'])
    assert.equal(parseQuestions(value).length, 0);
  assert.equal(parseQuestions('["One","Two"]').join(','), 'One,Two');
});
test('optional choices do not bypass required fields', () => {
  const question = {
    title: 'Appointment',
    copy: '',
    fields: ['Doctor’s name'],
    options: ['GP'],
    optionsOptional: true,
  };
  assert.equal(isStepReady(question, 0, { fields: {}, values: {} }), false);
  assert.equal(
    isStepReady(question, 0, { fields: { '0-Doctor’s name': 'Test' }, values: {} }),
    true,
  );
});

const appointmentDraft = load('src/care-planner/appointment-planning/appointment-draft/draft.ts');
test('appointment drafts retain named fields and selected questions independently', () => {
  let draft = appointmentDraft.emptyAppointmentDraft();
  draft = appointmentDraft.appointmentDraftReducer(draft, {
    type: 'field',
    field: 'doctor',
    value: 'Test',
  });
  draft = appointmentDraft.appointmentDraftReducer(draft, {
    type: 'toggleQuestion',
    value: 'Question',
  });
  assert.equal(draft.doctor, 'Test');
  assert.equal(draft.questions[0], 'Question');
  assert.equal(appointmentDraft.appointmentDetailsReady(draft), false);
  draft = appointmentDraft.appointmentDraftReducer(draft, {
    type: 'field',
    field: 'date',
    value: '01/10/2026',
  });
  assert.equal(appointmentDraft.appointmentDetailsReady(draft), true);
  const plan = appointmentDraft.buildAppointmentPlan({ ...draft, customQuestion: ' Custom ' }, [
    { group: 'Pain location', text: 'Question' },
  ]);
  assert.equal(plan.questions[0].group, 'Pain location');
  assert.equal(plan.questions[1].text, 'Custom');
});
test('new visits clear appointment drafts and legacy resumes validate their questions', () => {
  assert.equal(appointmentDraft.restoreAppointmentDraft({ doctor: 'Old' }).doctor, '');
  const draft = appointmentDraft.restoreAppointmentDraft({
    resume: '1',
    doctor: 'Test',
    questions: '{',
    service: 'Not added',
  });
  assert.equal(draft.doctor, 'Test');
  assert.equal(draft.questions.length, 0);
  assert.equal(draft.service, '');
});
const medications = load('src/my-health/prescriptions/state/model.ts');
test('medication edits replace one identity and retain structured form data', () => {
  const draft = { ...medications.emptyMedication(), name: ' Test ', strength: '1' };
  const list = medications.saveMedication([], draft, 'test');
  const edited = medications.saveMedication(
    list,
    { ...draft, strength: '2', form: 'Capsule' },
    'test',
  );
  assert.equal(edited.length, 1);
  assert.equal(edited[0].form, 'Capsule');
  assert.equal(list[0].strength, '1');
  assert.equal(medications.medicationLabel(edited[0]), 'Test 2 mg — Every day');
  assert.equal(medications.saveMedication(edited, { ...draft, strength: '0' }, 'test'), edited);
});

const assessmentRoutes = load('src/pain-tracker/routes.ts');
test('assessment links resolve to product routes and reject inherited or unknown names', () => {
  const expected = {
    pain: '/my-pain',
    movement: '/my-movement',
    personal: '/my-personal-care',
    social: '/my-social-health',
    management: '/my-management',
  };
  for (const [id, route] of Object.entries(expected)) {
    assert.equal(assessmentRoutes.resolveAssessmentId(id), id);
    assert.equal(assessmentRoutes.assessmentRoutes[id], route);
  }
  for (const value of [undefined, '', 'unknown', 'constructor', '__proto__'])
    assert.equal(assessmentRoutes.resolveAssessmentId(value), 'pain');
});
const { buildSummary } = load('src/shared/health-records/summaries.ts');
test('social summaries preserve impact thresholds and the optional reflection fallback', () => {
  const sections = buildSummary('social', {
    2: ['3'],
    3: ['6'],
    4: ['8'],
    5: ['Earlier reflection'],
  });
  assert.equal(sections[2].text, 'Pain slightly affects my mood.');
  assert.equal(sections[3].text, 'Pain moderately affects my relationships with others.');
  assert.equal(sections[4].text, 'Pain substantially impacts my ability to enjoy life.');
  assert.equal(sections[5].text, 'Earlier reflection');
  assert.equal(buildSummary('social', { 5: ['Earlier'], 6: ['Latest'] })[5].text, 'Latest');
});

const assessmentDraft = load('src/pain-tracker/shared/state/draft.ts');
test('assessment drafts preserve earlier answers, toggle choices, and clamp navigation', () => {
  const initial = assessmentDraft.createAssessmentDraft();
  const reduce = assessmentDraft.assessmentDraftReducer;
  let draft = reduce(initial, { type: 'select', value: 'Back', multiple: true });
  draft = reduce(draft, { type: 'select', value: 'Neck', multiple: true });
  draft = reduce(draft, { type: 'select', value: 'Back', multiple: true });
  draft = reduce(draft, { type: 'advance', questionCount: 2, fromStep: draft.step });
  draft = reduce(draft, { type: 'select', value: '0', multiple: false });
  draft = reduce(draft, { type: 'advance', questionCount: 2, fromStep: draft.step });
  assert.equal(draft.step, 1);
  assert.equal(draft.answers[0].join(','), 'Neck');
  assert.equal(draft.answers[1][0], '0');
  assert.equal(Object.keys(initial.answers).length, 0);
  draft = reduce(reduce(draft, { type: 'back' }), { type: 'back' });
  assert.equal(draft.step, 0);
});
test('saving locks a draft and a failed save preserves retryable answers', () => {
  const reduce = assessmentDraft.assessmentDraftReducer;
  let draft = reduce(assessmentDraft.createAssessmentDraft(), {
    type: 'select',
    value: 'Back',
    multiple: true,
  });
  draft = reduce(draft, { type: 'saving' });
  for (const action of [
    { type: 'select', value: 'Neck', multiple: true },
    { type: 'back' },
    { type: 'restart' },
  ])
    assert.equal(reduce(draft, action), draft);
  draft = reduce(draft, { type: 'failed', message: 'Retry' });
  assert.equal(draft.status, 'answering');
  assert.equal(draft.answers[0][0], 'Back');
  draft = reduce(reduce(draft, { type: 'saving' }), { type: 'saved' });
  assert.equal(draft.status, 'complete');
  draft = reduce(draft, { type: 'restart' });
  assert.equal(draft.status, 'answering');
  assert.equal(draft.error, '');
  assert.equal(draft.answers[0][0], 'Back');
});
test('required assessment input rejects blank values while zero scores and optional skips remain valid', () => {
  const q = { title: 'Question', prompt: 'Prompt', kind: 'text' };
  for (const values of [[], [''], ['  ']])
    assert.equal(assessmentDraft.questionAnswered(q, values), false);
  assert.equal(assessmentDraft.questionAnswered({ ...q, optional: true }, []), true);
  assert.equal(assessmentDraft.questionAnswered({ ...q, kind: 'score' }, ['0']), true);
  assert.equal(assessmentDraft.questionAnswered({ ...q, kind: 'score' }, ['11']), false);
  assert.equal(assessmentDraft.questionAnswered({ ...q, kind: 'number' }, ['2.5']), false);
  assert.equal(assessmentDraft.questionAnswered({ ...q, kind: 'number' }, ['24']), true);
});

test('rapid repeated Continue actions cannot skip an unanswered assessment question', () => {
  const draft = assessmentDraft.createAssessmentDraft();
  const action = { type: 'advance', questionCount: 6, fromStep: 0 };
  const next = assessmentDraft.assessmentDraftReducer(draft, action);
  assert.equal(assessmentDraft.assessmentDraftReducer(next, action).step, 1);
});

test('account deletion clears the feature-owned appointment store through registered cleanup', async () => {
  const fixture = accountFixture();
  const account = fixture.load();
  const plans = load('src/care-planner/appointments/repository.ts', {
    '@/shared/account/repository': account,
  });
  plans.addAppointment({ doctor: 'Test', date: '01/10/2026', service: 'GP' });
  assert.ok(plans.getAppointments().length > 0);
  await account.deleteLocalAccount();
  assert.equal(plans.getAppointments().length, 0);
  const reopened = load('src/care-planner/appointments/repository.ts', {
    '@/shared/account/repository': account,
  });
  assert.equal(reopened.getAppointments().length, 0);
});
test('cleanup registrations replace the same owner without affecting other feature owners', async () => {
  const account = accountFixture().load();
  let replaced = 0,
    current = 0,
    another = 0;
  account.registerAccountCleanup('one', () => {
    replaced++;
  });
  account.registerAccountCleanup('one', () => {
    current++;
  });
  account.registerAccountCleanup('two', () => {
    another++;
  });
  await account.deleteLocalAccount();
  assert.equal(replaced, 0);
  assert.equal(current, 1);
  assert.equal(another, 1);
});
