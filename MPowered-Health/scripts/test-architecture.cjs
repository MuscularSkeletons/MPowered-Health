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
  return source.statements.flatMap((statement) => {
    const specifier = statement.moduleSpecifier;
    if (!specifier || !ts.isStringLiteral(specifier)) return [];
    const name = specifier.text;
    return name.startsWith('@/')
      ? [path.join(src, name.slice(2))]
      : name.startsWith('.')
        ? [path.resolve(path.dirname(file), name)]
        : [];
  });
}
test('app-wide shared modules do not depend on product features or routes', () => {
  for (const file of files(path.join(src, 'shared')))
    for (const dependency of dependencies(file))
      assert.ok(
        !dependency.startsWith(path.join(src, 'features') + path.sep) &&
          !dependency.startsWith(path.join(src, 'app') + path.sep),
        `${file} imports ${dependency}`,
      );
});
test('reusable assessment engine does not import individual assessments or route entries', () => {
  const engine = path.join(src, 'features/pain-tracker/shared/assessment');
  for (const file of files(engine))
    for (const dependency of dependencies(file))
      assert.ok(
        dependency.startsWith(engine + path.sep) ||
          dependency.startsWith(path.join(src, 'shared') + path.sep),
        `${file} imports ${dependency}`,
      );
});
test('feature implementations do not depend on the Expo route directory', () => {
  for (const file of files(path.join(src, 'features')))
    for (const dependency of dependencies(file))
      assert.ok(
        !dependency.startsWith(path.join(src, 'app') + path.sep),
        `${file} imports ${dependency}`,
      );
});
