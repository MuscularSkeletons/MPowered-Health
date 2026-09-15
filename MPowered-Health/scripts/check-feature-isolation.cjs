/* global __dirname, process */
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');
const { tabs } = require('./sync-routes.cjs');
const features = [...tabs, 'auth', 'shared'];
const selected = process.argv.slice(2);
if (selected.some((name) => !features.includes(name)))
  throw new Error('Unknown feature. Choose: ' + features.join(', '));
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
let failed = false;
for (const feature of selected.length ? selected : features) {
  const own = path.join(src, feature) + path.sep;
  const shared = path.join(src, 'shared') + path.sep;
  const allowed = (file) =>
    (!file.startsWith(src + path.sep) && !file.startsWith(path.join(root, 'app') + path.sep)) ||
    file.startsWith(own) ||
    file.startsWith(shared) ||
    path.dirname(file) === src;
  const roots = parsed.fileNames.filter((file) => allowed(file));
  const host = ts.createCompilerHost(parsed.options);
  const readFile = host.readFile;
  const fileExists = host.fileExists;
  // Make other feature and route implementations unavailable, even if imports try to pull them in.
  host.readFile = (file) => (allowed(file) ? readFile(file) : undefined);
  host.fileExists = (file) => allowed(file) && fileExists(file);
  const getSourceFile = host.getSourceFile;
  host.getSourceFile = (file, ...args) =>
    allowed(file) ? getSourceFile(file, ...args) : undefined;
  const program = ts.createProgram(roots, { ...parsed.options, noEmit: true }, host);
  if (program.getSourceFiles().some((file) => !allowed(file.fileName)))
    throw new Error('Isolation boundary was bypassed');
  const errors = ts.getPreEmitDiagnostics(program);
  if (errors.length) {
    failed = true;
    process.stderr.write(
      ts.formatDiagnosticsWithColorAndContext(errors, {
        getCanonicalFileName: (x) => x,
        getCurrentDirectory: () => root,
        getNewLine: () => '\n',
      }),
    );
  }
  process.stdout.write(
    `${feature}: ${errors.length ? 'FAILED' : 'passed with other feature source folders unavailable'}\n`,
  );
}
process.exitCode = failed ? 1 : 0;
