// This test file checks printing, sharing, copying, and report error handling.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Load each export module with controlled platform tools instead of opening real dialogs.
function load(name, mocks = {}, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src/utils', name + '.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, Error, ...globals, require: (id) => {
    if (id in mocks) return mocks[id];
    if (id === './pain-profile-report') return load('pain-profile-report');
    throw new Error('Unexpected dependency: ' + id);
  } });
  return exports;
}
const report = { updatedAt: '7 September 2026', sections: [
  // Include every profile section plus characters and line breaks that need special handling.
  { title: 'About me', subtitle: '', items: [['Name', 'Test <script>alert(1)</script> & "Person"']] },
  { title: 'My conditions', subtitle: '', items: [['Primary condition', 'Arthritis']] },
  { title: 'My Pain', subtitle: 'Severity, pattern, and location', items: [['Current pain: 5', 'Moderate pain.']] },
  { title: 'Impacts to Movement', subtitle: '', items: [['Walking:', 'First line\nSecond line']] },
  { title: 'Impacts to Personal care', subtitle: '', items: [['Sleeping', '']] },
  { title: 'Impacts to Social Health', subtitle: '', items: [['Mood', 'Test summary']] },
  { title: 'My Current Management', subtitle: '', items: [['Exercise', '30 minutes']] },
] };

// Report builders must preserve content while keeping generated HTML safe.
test('HTML and text contain every section, date and answer; HTML escapes user content', () => {
  const { profileReportHtml, profileReportText } = load('pain-profile-report');
  const html = profileReportHtml(report), text = profileReportText(report);
  for (const section of report.sections) {
    assert.ok(html.includes(section.title));
    assert.ok(text.includes(section.title));
  }
  assert.ok(html.includes('7 September 2026'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('white-space: pre-wrap'));
  assert.ok(html.includes('break-inside: avoid'));
  assert.ok(text.includes('Walking: First line\nSecond line'));
  assert.ok(text.includes('Sleeping: Not recorded'));
  assert.ok(!text.includes('Walking::'));
  assert.ok(profileReportHtml({ ...report, updatedAt: '' }).includes('No completed assessments yet'));
});

// Native action tests replace operating-system print and share dialogs with call logs.
test('native printing receives the full report and sharing receives a PDF file', async () => {
  const calls = [];
  const api = load('pain-profile-export', {
    'expo-print': {
      printAsync: async (options) => calls.push(['print', options]),
      printToFileAsync: async (options) => { calls.push(['pdf', options]); return { uri: 'file:///test.pdf' }; },
    },
    'expo-sharing': {
      isAvailableAsync: async () => true,
      shareAsync: async (uri, options) => calls.push(['share', uri, options]),
    },
    'react-native': { Share: { share: async () => assert.fail('PDF sharing is supported') } },
  });
  await api.printProfile(report);
  assert.equal(await api.shareProfile(report), 'done');
  assert.equal(calls[0][1].html, calls[1][1].html);
  assert.equal(calls[2][1], 'file:///test.pdf');
  assert.equal(calls[2][2].mimeType, 'application/pdf');
  assert.equal(calls[2][2].UTI, 'com.adobe.pdf');
});

test('native sharing falls back to the complete text when file sharing is unavailable', async () => {
  let shared;
  const api = load('pain-profile-export', {
    'expo-print': {},
    'expo-sharing': { isAvailableAsync: async () => false },
    'react-native': { Share: { share: async (data) => { shared = data; } } },
  });
  await api.shareProfile(report);
  assert.ok(shared.message.includes('My Current Management'));
});

test('PDF generation failures propagate so the UI can show an error and retry', async () => {
  const api = load('pain-profile-export', {
    'expo-print': { printToFileAsync: async () => { throw new Error('Disk full'); } },
    'expo-sharing': { isAvailableAsync: async () => true, shareAsync: async () => assert.fail('No file was generated') },
    'react-native': {},
  });
  await assert.rejects(api.shareProfile(report), /Disk full/);
});

// Web action tests exercise supported APIs as well as every documented fallback.
test('web sharing uses the report text, with unsupported, rejected and cancelled outcomes', async () => {
  let shared;
  const navigator = {};
  const api = load('pain-profile-export.web', {}, { navigator });
  assert.equal(await api.shareProfile(report), 'copy');
  navigator.share = async (data) => { shared = data; };
  assert.equal(await api.shareProfile(report), 'done');
  assert.ok(shared.text.includes('My Pain Profile'));
  assert.ok(shared.text.includes('30 minutes'));
  navigator.share = async () => { throw new Error('NotAllowedError'); };
  assert.equal(await api.shareProfile(report), 'copy');
  navigator.share = async () => { const error = new Error('Cancelled'); error.name = 'AbortError'; throw error; };
  assert.equal(await api.shareProfile(report), 'done');
});

test('web printing prints the isolated HTML document and cleans up after the dialog', async () => {
  let printed = false, removed = false, afterPrint;
  const timers = new Map();
  const frame = { style: {}, setAttribute() {}, remove() { removed = true; }, contentWindow: {
    addEventListener(event, handler) { assert.equal(event, 'afterprint'); afterPrint = handler; },
    focus() {}, print() { printed = true; },
  } };
  const api = load('pain-profile-export.web', {}, {
    document: { createElement(tag) { assert.equal(tag, 'iframe'); return frame; }, body: { appendChild() { frame.onload(); } } },
    setTimeout(fn, duration) { timers.set(duration, fn); return duration; },
    clearTimeout(id) { timers.delete(id); },
  });
  await api.printProfile(report);
  assert.ok(printed);
  assert.ok(frame.srcdoc.includes('My Current Management'));
  assert.ok(!frame.srcdoc.includes('Care Planner'));
  assert.ok(!removed, 'Keep the frame while the print dialog is open');
  afterPrint();
  assert.ok(removed);
  assert.equal(timers.size, 0);
});

test('web print failure rejects and removes the temporary document', async () => {
  let removed = false;
  const frame = { style: {}, setAttribute() {}, remove() { removed = true; }, contentWindow: null };
  const api = load('pain-profile-export.web', {}, {
    document: { createElement: () => frame, body: { appendChild() { frame.onload(); } } },
    setTimeout: () => 1, clearTimeout() {},
  });
  await assert.rejects(api.printProfile(report), /unavailable/);
  assert.ok(removed);
});

test('copy uses clipboard, falls back to selection, and reports failures honestly', async () => {
  let copied, selected = false, removed = false, restored = false, legacyResult = true;
  const navigator = { clipboard: { writeText: async (text) => { copied = text; } } };
  const field = { style: {}, select() { selected = true; }, remove() { removed = true; } };
  const api = load('pain-profile-export.web', {}, {
    navigator,
    document: { activeElement: { focus() { restored = true; } }, createElement: () => field,
      body: { appendChild() {} }, execCommand: () => legacyResult },
  });
  assert.equal(await api.copyProfile('Report'), true);
  assert.equal(copied, 'Report');
  navigator.clipboard.writeText = async () => { throw new Error('Denied'); };
  assert.equal(await api.copyProfile('Fallback report'), true);
  assert.equal(field.value, 'Fallback report');
  assert.ok(selected && removed && restored);
  legacyResult = false;
  assert.equal(await api.copyProfile('Manual copy'), false);
});

// Cancellation is expected user behavior; real printer failures must still reach the screen.
test('dismissing iOS printing is quiet while printer failures still propagate', async () => {
  let message = 'Printing did not complete';
  const api = load('pain-profile-export', {
    'expo-print': { printAsync: async () => { throw new Error(message); } },
    'expo-sharing': {}, 'react-native': {},
  });
  await api.printProfile(report);
  message = 'Printer unavailable';
  await assert.rejects(api.printProfile(report), /Printer unavailable/);
});
