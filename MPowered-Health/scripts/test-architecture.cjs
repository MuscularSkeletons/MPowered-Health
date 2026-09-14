/* global __dirname */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
const src = path.resolve(__dirname, '../src');
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? files(file) : /\.tsx?$/.test(file) ? [file] : [];
  });
}
function dependencies(file) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const result = [];
  function visit(node) {
    let specifier;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
      specifier = node.moduleSpecifier;
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    )
      specifier = node.arguments[0];
    if (specifier && ts.isStringLiteral(specifier)) {
      const name = specifier.text;
      if (name.startsWith('@/')) result.push(path.join(src, name.slice(2)));
      else if (name.startsWith('.')) result.push(path.resolve(path.dirname(file), name));
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return result;
}
const { tabs, routeFiles, syncRoutes } = require('./sync-routes.cjs');
test('shared source modules never import a tab implementation', () => {
  for (const file of files(path.join(src, 'shared')))
    for (const dependency of dependencies(file)) {
      assert.ok(
        ![...tabs, 'auth'].some((tab) => dependency.startsWith(path.join(src, tab) + path.sep)),
        `${file} imports ${dependency}`,
      );
      assert.ok(
        !dependency.startsWith(path.resolve(src, '../app') + path.sep),
        `${file} imports generated route ${dependency}`,
      );
    }
});
test('reusable assessment engine only imports its own code and shared contracts', () => {
  const engine = path.join(src, 'pain-tracker/shared/assessment');
  for (const file of files(engine))
    for (const dependency of dependencies(file))
      assert.ok(
        dependency.startsWith(engine + path.sep) ||
          dependency.startsWith(path.join(src, 'shared') + path.sep),
        `${file} imports ${dependency}`,
      );
});
for (const tab of [...tabs, 'auth']) {
  test(`${tab} only imports its own module and shared code`, () => {
    const own = path.join(src, tab) + path.sep;
    for (const file of files(own))
      for (const dependency of dependencies(file)) {
        if (
          !dependency.startsWith(src + path.sep) ||
          dependency.startsWith(path.join(src, 'assets') + path.sep)
        )
          continue;
        assert.ok(
          dependency.startsWith(own) || dependency.startsWith(path.join(src, 'shared') + path.sep),
          `${file} imports ${dependency}`,
        );
      }
  });
  test(`${tab} implementation cannot import generated routes`, () => {
    for (const file of files(path.join(src, tab)))
      for (const dependency of dependencies(file))
        assert.ok(
          !dependency.startsWith(path.resolve(src, '../app') + path.sep),
          `${file} imports ${dependency}`,
        );
  });
}
test('generated route bridge preserves tab entries, activation and legacy URLs', () => {
  const routes = routeFiles();
  for (const route of [
    '(main)/(pain-tracker)/dashboard.tsx',
    '(main)/(my-health)/explore.tsx',
    '(main)/(care-planner)/care.tsx',
    '(main)/(settings)/settings.tsx',
    '(auth)/get-started-loading.tsx',
    '(auth)/get-started/[step].tsx',
    '(legacy)/onboarding/[step].tsx',
  ])
    assert.ok(routes.has(route), route);
  assert.match(routes.get('(auth)/get-started/[step].tsx'), /export \*/);
  assert.equal(syncRoutes(true), routes.size);
});

test('merged modules explicitly register routes without exposing supporting files', () => {
  const routes = routeFiles();
  for (const module of [...tabs, 'auth']) {
    const root = path.join(src, module);
    assert.ok(!fs.existsSync(path.join(root, 'app')));
    assert.ok(!fs.existsSync(path.join(root, 'features')));
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'route-paths.json'), 'utf8'));
    for (const source of Object.keys(manifest)) {
      assert.ok(fs.existsSync(path.join(root, source)), source);
      assert.ok(/(?:screen|route|_layout)\.tsx$/.test(source), source);
    }
  }
  for (const url of routes.keys()) assert.ok(!/repository|types|DraftProvider/.test(url), url);
});

test('renamed route sources retain existing public links and merged entry aliases', () => {
  const routes = routeFiles();
  for (const [url, feature] of [
    ['(main)/(my-health)/profile.tsx', 'pain-profile'],
    ['(main)/(my-health)/tips.tsx', 'pain-guide'],
    ['(main)/(care-planner)/appointment/details.tsx', 'appointment-planning/details'],
    ['(auth)/login.tsx', 'sign-in'],
  ])
    assert.ok(routes.get(url)?.includes(`/${feature}/screen`), url);
  assert.match(
    routes.get('(main)/(care-planner)/appointment-review.tsx'),
    /@\/care-planner\/appointments\/route/,
  );
  assert.equal(routes.get('(auth)/index.tsx'), routes.get('(auth)/splash.tsx'));
  assert.equal(
    routes.get('(main)/(my-health)/prescriptions/new.tsx'),
    routes.get('(main)/(my-health)/prescriptions/edit.tsx'),
  );
  assert.equal(routes.size, 51);
});
