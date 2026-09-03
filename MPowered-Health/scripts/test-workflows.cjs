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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (name) => imports[name], Date });
  return exports;
}
const { validAnswer, workflowStep } = load('src/utils/workflow-validation.ts');

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
  const first = load('src/constants/reflections.ts', imports);
  assert.equal(first.reflectionWeek(new Date(2026, 8, 6)), '2026-08-31');
  assert.equal(first.reflectionWeek(new Date(2026, 8, 7)), '2026-09-07');
  await first.saveReflection(' First week ', '2026-08-31');
  const reopened = load('src/constants/reflections.ts', imports);
  assert.equal((await reopened.getReflection('2026-08-31')).notes, 'First week');
  await reopened.saveReflection('Second week', '2026-09-07');
  assert.equal((await reopened.getReflection('2026-08-31')).notes, 'First week');
  await assert.rejects(reopened.saveReflection('   ', '2026-08-31'));
  assert.equal((await reopened.getReflection('2026-08-31')).notes, 'First week');
});
test('storage failures are surfaced instead of reporting a successful save', async () => {
  const reflections = load('src/constants/reflections.ts', {
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
    '@/utils/workflow-validation': { validAnswer },
    './profile-options': load('src/constants/profile-options.ts'),
    './assessment-session': {
      resetAssessmentSession: () => {
        resets++;
      },
    },
    './appointments': {
      resetAppointments: () => {
        resets++;
      },
    },
  };
  return {
    stored,
    storage,
    load: () => load('src/constants/account.ts', imports),
    resets: () => resets,
  };
}
const sampleProfile = {
  email: 'alex@example.com',
  name: 'Alex',
  sex: 'Prefer not to say',
  birthYear: '',
  diagnosis: 'No, I haven’t',
  conditions: [],
  otherConditions: '',
};

test('onboarding profile persists and edits preserve optional answers without saving verification codes', async () => {
  const fixture = accountFixture();
  const account = fixture.load();
  const profile = account.profileFromAnswers(
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
