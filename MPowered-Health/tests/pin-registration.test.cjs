// This test file checks PIN registration, storage, sign-in, and lockout behavior.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { webcrypto } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Simulate native and web credential stores so PIN behavior can be tested without a device.
function environment({ web = false, storage = new Map(), secure = new Map() } = {}) {
  // The clock is controllable so the one-minute lock can be tested instantly.
  let failKey = '', failSecureWrite = false, now = Date.now();
  class Clock extends Date { static now() { return now; } }
  const cache = new Map();
  const asyncStorage = {
    // Failures can be enabled for one key to verify registration rollback behavior.
    getItem: async (key) => storage.get(key) ?? null,
    setItem: async (key, value) => { if (key === failKey) throw new Error('Storage unavailable'); storage.set(key, value); },
    removeItem: async (key) => { storage.delete(key); },
    getAllKeys: async () => [...storage.keys()],
    multiRemove: async (keys) => keys.forEach((key) => storage.delete(key)),
  };
  const secureStore = {
    // Mirror the small part of Expo SecureStore used by the production module.
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 6,
    getItemAsync: async (key) => secure.get(key) ?? null,
    setItemAsync: async (key, value, options) => {
      if (failSecureWrite) throw new Error('Credential store unavailable');
      assert.equal(options.keychainAccessible, 6);
      secure.set(key, value);
    },
    deleteItemAsync: async (key) => { secure.delete(key); },
  };
  function load(relative) {
    // Transpile source modules into an isolated CommonJS context with the mocks above.
    if (web && relative === 'constants/pin-credential') relative += '.web';
    if (cache.has(relative)) return cache.get(relative);
    const exports = {}; cache.set(relative, exports);
    const source = fs.readFileSync(path.join(__dirname, '../src', relative + '.ts'), 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    vm.runInNewContext(code, { exports, Date: Clock, Error, TextEncoder, crypto: webcrypto, require: (name) => {
      if (name === '@react-native-async-storage/async-storage') return { default: asyncStorage };
      if (name === 'expo-secure-store') return secureStore;
      if (name === './assessment-session') return { resetAssessmentSession() {}, markAssessmentCompleted() {} };
      if (name === './pain-history') return { finishPainHistoryWrites: async () => {}, getPainHistory: () => [], loadPainHistory: async () => {} };
      if (name === './appointments') return { resetAppointments() {} };
      return load(name.startsWith('@/') ? name.slice(2) : path.normalize(path.join(path.dirname(relative), name)));
    } });
    return exports;
  }
  return { load, storage, secure, failStorage(key) { failKey = key; }, failSecure() { failSecureWrite = true; }, advance(ms) { now += ms; } };
}
const profile = { email: 'pin-test@example.test', name: 'PIN Test', sex: 'Prefer not to say', birthYear: '', diagnosis: 'No, I haven’t', conditions: [], otherConditions: '' };

// Registration accepts four digits exactly and keeps leading zeroes meaningful.
test('registration requires exactly four digits, including leading zeroes', () => {
  const env = environment();
  const { isValidPin, pinDigits } = env.load('utils/pin-validation');
  const { validAnswer } = env.load('utils/workflow-validation');
  for (const pin of ['', '1', '12', '123', '12345', '123456', 'abcd', '12a4', ' 1234', '1234 ']) {
    assert.equal(isValidPin(pin), false);
    assert.equal(validAnswer('Create PIN', pin), false);
  }
  for (const pin of ['0000', '0123', '1234', '9999']) assert.equal(validAnswer('Create PIN', pin), true);
  assert.equal(pinDigits('0a12-34'), '0123');
});

test('no account is saved when PIN or profile validation fails', async () => {
  const env = environment();
  const account = env.load('constants/account');
  await assert.rejects(account.registerProfile(profile, '123'), /four-digit PIN/);
  await assert.rejects(account.registerProfile({ ...profile, email: 'invalid' }, '1234'));
  assert.equal(env.storage.size, 0);
  assert.equal(env.secure.size, 0);
});

test('registration saves PIN separately and login checks the matching four-digit PIN after restart', async () => {
  const env = environment();
  await env.load('constants/account').registerProfile(profile, '0123');
  assert.equal(JSON.parse(env.storage.get('mpowered:profile')).pin, undefined);
  assert.equal(env.storage.has('mpowered.pin.v1'), false);
  assert.equal(env.secure.size, 1);
  const restarted = environment({ storage: env.storage, secure: env.secure });
  const auth = restarted.load('constants/pin-auth');
  assert.equal((await auth.verifyAccountPin('9999')).ok, false);
  assert.equal((await auth.verifyAccountPin('123')).ok, false);
  assert.equal((await auth.verifyAccountPin('0123')).ok, true);
});

test('missing PINs and credentials for another account do not sign in', async () => {
  const env = environment();
  assert.equal((await env.load('constants/pin-auth').verifyAccountPin('0123')).ok, false);
  await env.load('constants/account').registerProfile(profile, '0123');
  env.storage.set('mpowered:profile', JSON.stringify({ ...profile, email: 'someone-else@example.test' }));
  assert.equal((await env.load('constants/pin-auth').verifyAccountPin('0123')).ok, false);
});

// A failed half of registration must roll back the other half before retrying.
test('credential-store failure prevents completing registration; profile failure rolls back the PIN', async () => {
  const unavailable = environment(); unavailable.failSecure();
  await assert.rejects(unavailable.load('constants/account').registerProfile(profile, '0123'));
  assert.equal(unavailable.storage.has('mpowered:profile'), false);
  const env = environment(); env.failStorage('mpowered:profile');
  await assert.rejects(env.load('constants/account').registerProfile(profile, '0123'));
  assert.equal(env.secure.size, 0);
  env.failStorage('');
  await env.load('constants/account').registerProfile(profile, '0123');
  assert.equal((await env.load('constants/pin-auth').verifyAccountPin('0123')).ok, true);
});

// The recovery requirement persists so restarting the app cannot restore PIN attempts.
test('five failures require email verification, including after restart', async () => {
  const env = environment();
  await env.load('constants/account').registerProfile(profile, '0123');
  const auth = env.load('constants/pin-auth');
  const results = await Promise.all(Array.from({ length: 5 }, () => auth.verifyAccountPin('9999')));
  assert.ok(results.every((result) => !result.ok));
  assert.equal(results[3].requiresEmailVerification, undefined);
  assert.equal(results[4].requiresEmailVerification, true);
  assert.match(results[4].message, /Verify your email address/);
  const restarted = environment({ storage: env.storage, secure: env.secure });
  const afterRestart = await restarted.load('constants/pin-auth').verifyAccountPin('0123');
  assert.equal(afterRestart.ok, false);
  assert.equal(afterRestart.requiresEmailVerification, true);
});

test('account deletion clears the PIN and failed-attempt state', async () => {
  const env = environment();
  const account = env.load('constants/account');
  await account.registerProfile(profile, '0123');
  await env.load('constants/pin-auth').verifyAccountPin('9999');
  await account.deleteLocalAccount();
  assert.equal(env.secure.size, 0);
  assert.equal(env.storage.has('mpowered:pin-attempts'), false);
  assert.equal((await env.load('constants/pin-auth').verifyAccountPin('0123')).ok, false);
});

// Browser credentials store a random salt and derived hash rather than readable digits.
test('web stores a salted verifier and verifies the PIN without storing the PIN itself', async () => {
  const env = environment({ web: true });
  await env.load('constants/account').registerProfile(profile, '0123');
  const raw = env.storage.get('mpowered:pin-credential:v1');
  const credential = JSON.parse(raw);
  assert.equal(credential.pin, undefined);
  assert.equal(credential.salt.length, 32);
  assert.equal(credential.hash.length, 64);
  const api = env.load('constants/pin-credential');
  assert.equal(await api.matchesPinCredential(raw, profile.email, '0123'), true);
  assert.equal(await api.matchesPinCredential(raw, profile.email, '9999'), false);
  const next = JSON.parse(await api.createPinCredential(profile.email, '0123'));
  assert.notEqual(next.salt, credential.salt);
  assert.notEqual(next.hash, credential.hash);
});
