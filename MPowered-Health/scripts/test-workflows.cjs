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
