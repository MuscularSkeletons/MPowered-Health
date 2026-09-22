// Checks My Pain persistence and ensures unfinished backend integrations never write records.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadRepository(supabase) {
  const source = fs.readFileSync(
    path.join(__dirname, '../src/shared/health-records/assessment-repository.ts'),
    'utf8',
  );
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      if (name === '@/lib/supabase/client') return { supabase };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}

const recordedAt = '2026-09-22T01:02:03.000Z';

test('only My Pain maps to a backend table', () => {
  const { buildAssessmentInsert } = loadRepository({});
  const insert = buildAssessmentInsert('pain',
    { 0: ['Back'], 1: ['Aching'], 2: ['4'], 3: ['2'], 4: ['9'], 5: ['6'] }, recordedAt);
  assert.equal(insert.table, 'pain_assessment');
  assert.equal(insert.values.average_pain, 6);
  assert.equal(insert.values.created_at, recordedAt);
});

test('all four unfinished integrations complete without accessing Supabase', async () => {
  const forbidden = () => { throw new Error('Backend must not be accessed'); };
  const repository = loadRepository({ auth: { getSession: forbidden }, from: forbidden });
  for (const id of ['movement', 'personal', 'social', 'management']) {
    assert.equal(repository.buildAssessmentInsert(id, {}), null);
    await repository.saveAssessmentRecord(id, {});
  }
});

test('backend failures reject instead of showing a false saved summary', async () => {
  const supabase = {
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null,
      }),
    },
    from: () => ({ insert: async () => ({ error: { message: 'Table unavailable' } }) }),
  };
  const { saveAssessmentRecord } = loadRepository(supabase);
  await assert.rejects(
    saveAssessmentRecord(
      'pain',
      { 0: ['Back'], 1: ['Aching'], 2: ['4'], 3: ['2'], 4: ['9'], 5: ['6'] },
      recordedAt,
    ),
    /Table unavailable/,
  );
});

// Model the live schema: ownership is on Assessment, and pain rows reference that parent.
const painAnswers = { 0: ['Back'], 1: ['Aching'], 2: ['4'], 3: ['2'], 4: ['9'], 5: ['6'] };
function ownedDatabase({ signedIn = true, failChild = false } = {}) {
  const parents = new Map();
  const children = [];
  return {
    parents, children,
    auth: { getSession: async () => ({ data: { session: signedIn ? { user: { id: 'account-1' } } : null } }) },
    from: (table) => ({
      insert: async ([row]) => {
        if (table === 'Assessment') {
          assert.equal(row.user_id, 'account-1');
          parents.set(row.assessment_id, row);
          return { error: null };
        }
        assert.equal(table, 'pain_assessment');
        assert.equal('user_id' in row, false, 'Live pain table has no user_id column');
        assert.equal(parents.get(row.assessment_id)?.user_id, 'account-1');
        if (failChild) return { error: { message: 'Pain insert rejected' } };
        children.push(row);
        return { error: null };
      },
      delete: () => ({ eq: async (column, id) => {
        assert.equal(table, 'Assessment');
        assert.equal(column, 'assessment_id');
        parents.delete(id);
        return { error: null };
      } }),
    }),
  };
}

test('My Pain links answers to an account-owned parent using the live schema', async () => {
  const database = ownedDatabase();
  await loadRepository(database).saveAssessmentRecord('pain', painAnswers, recordedAt);
  assert.equal(database.parents.size, 1);
  assert.equal(database.children.length, 1);
  assert.equal(database.children[0].average_pain, 6);
});

test('My Pain rejects signed-out saves without creating records', async () => {
  const database = ownedDatabase({ signedIn: false });
  await assert.rejects(loadRepository(database).saveAssessmentRecord('pain', painAnswers), /sign in again/);
  assert.equal(database.parents.size, 0);
  assert.equal(database.children.length, 0);
});

test('My Pain removes the empty parent if saving its answers fails', async () => {
  const database = ownedDatabase({ failChild: true });
  await assert.rejects(loadRepository(database).saveAssessmentRecord('pain', painAnswers), /Pain insert rejected/);
  assert.equal(database.parents.size, 0);
  assert.equal(database.children.length, 0);
});
