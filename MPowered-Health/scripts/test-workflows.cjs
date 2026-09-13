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
  const first = load('src/features/reflection/services/reflections.ts', imports);
  assert.equal(first.reflectionWeek(new Date(2026, 8, 6)), '2026-08-31');
  assert.equal(first.reflectionWeek(new Date(2026, 8, 7)), '2026-09-07');
  await first.saveReflection(' First week ', '2026-08-31');
  const reopened = load('src/features/reflection/services/reflections.ts', imports);
  assert.equal((await reopened.getReflection('2026-08-31')).notes, 'First week');
  await reopened.saveReflection('Second week', '2026-09-07');
  assert.equal((await reopened.getReflection('2026-08-31')).notes, 'First week');
  await assert.rejects(reopened.saveReflection('   ', '2026-08-31'));
  assert.equal((await reopened.getReflection('2026-08-31')).notes, 'First week');
});
test('storage failures are surfaced instead of reporting a successful save', async () => {
  const reflections = load('src/features/reflection/services/reflections.ts', {
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
    '@/features/auth/models/pin-validation': load('src/features/auth/models/pin-validation.ts'),
    '@/features/auth/services/pin-credential': {
      writePinCredential: async () => {},
      readPinCredential: async () => null,
    },
    '@/features/pain/services/pain-history': {
      finishPainHistoryWrites: async () => {},
      loadPainHistory: async () => {},
      getPainHistory: () => [],
    },
    '@/features/profile/models/profile-options': load(
      'src/features/profile/models/profile-options.ts',
    ),
    '@/features/assessment/state/assessment-session': {
      resetAssessmentSession: () => {
        resets++;
      },
    },
    '@/features/appointments/services/appointments': {
      resetAppointments: () => {
        resets++;
      },
    },
  };
  return {
    stored,
    storage,
    load: () => load('src/features/account/services/account.ts', imports),
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
  const profile = load('src/features/auth/services/registration-profile.ts').profileFromAnswers(
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
  'src/features/auth/models/registration-draft.ts',
);
const { isStepReady } = load('src/features/auth/services/registration-validation.ts', {
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
const { parseQuestions } = load('src/features/appointments/services/route-params.ts');
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

const appointmentDraft = load('src/features/appointments/models/appointment-draft.ts');
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
const medications = load('src/features/medications/models/medication.ts');
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
