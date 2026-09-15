/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const jsx = (type, props) => ({ type, props });
function loadScreen(file, imports, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, '../src/auth/get-started', file), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2020,
      },
    },
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    ...globals,
    require: (name) => {
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'Fragment' };
      if (name in imports) return imports[name];
      if (name.startsWith('@/assets/')) return name;
      throw new Error('Missing screen dependency: ' + name);
    },
  });
  return exports.default;
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)];
}
const common = {
  '@/shared/ui/mha-ui': { ActionButton: 'ActionButton' },
  'expo-status-bar': { StatusBar: 'StatusBar' },
  'react-native': Object.fromEntries(
    ['Text', 'View', 'Pressable', 'Image'].map((name) => [name, name]),
  ),
};
test('finishing registration opens the activation screens with the entered name', async () => {
  let destination;
  const Screen = loadScreen('questions/screen.tsx', {
    ...common,
    '@/shared/account/repository': {
      registerProfile: () => assert.fail('Account was already registered'),
    },
    './Fields': { QuestionFields: 'QuestionFields' },
    './content': {
      getStarted: {
        steps: Array.from({ length: 11 }, () => ({
          title: 'Complete',
          copy: '',
          action: 'Get started',
        })),
      },
    },
    './validation': { isStepReady: () => true },
    '../form-data/DraftProvider': {
      useRegistration: () => ({
        draft: { fields: { '3-Type your name': 'Ada' }, values: {} },
        dispatch: () => {},
      }),
    },
    '../to-profile': { profileFromAnswers: () => assert.fail('Must not register twice') },
    '@/shared/forms/FormScreen': { Shell: 'Shell' },
    '@/shared/forms/styles': { s: {} },
    '@/shared/forms/validation': { workflowStep: (value) => Number(value) },
    'expo-router': {
      useLocalSearchParams: () => ({ step: '10' }),
      router: {
        replace: (value) => {
          destination = value;
        },
      },
    },
    react: { useRef: (value) => ({ current: value }), useState: (value) => [value, () => {}] },
  });
  await nodes(Screen())
    .find((node) => node.type === 'ActionButton')
    .props.onPress();
  assert.equal(destination.pathname, '/get-started-loading');
  assert.equal(destination.params.name, 'Ada');
});
test('activation screens show all three slides before Continue opens the dashboard', () => {
  let page = 0;
  let timer;
  let destination;
  const Screen = loadScreen(
    'activation-screens/screen.tsx',
    {
      ...common,
      './styles': { s: {} },
      'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
      'expo-router': {
        useLocalSearchParams: () => ({ name: 'Ada' }),
        router: {
          replace: (value) => {
            destination = value;
          },
        },
      },
      react: {
        useState: () => [
          page,
          (update) => {
            page = update(page);
          },
        ],
        useEffect: (effect) => effect(),
      },
    },
    {
      setTimeout: (callback, delay) => {
        timer = { callback, delay };
        return 1;
      },
      clearTimeout: () => {},
    },
  );
  const messages = [
    "You're off to an MPowered start!",
    'Next, you’ll complete short questionnaires about how your pain is impacting you.',
    'Based on your answers, this app suggests questions you can ask your doctor.',
  ];
  for (let index = 0; index < 3; index++) {
    const tree = Screen();
    assert.ok(nodes(tree).some((node) => node.props?.children === messages[index]));
    const button = nodes(tree).find((node) => node.type === 'ActionButton');
    if (index < 2) {
      assert.equal(button, undefined);
      assert.equal(destination, undefined);
      assert.equal(timer.delay, index === 0 ? 1800 : 2600);
      timer.callback();
    } else {
      assert.equal(button.props.label, 'Continue');
      button.props.onPress();
    }
  }
  assert.equal(destination.pathname, '/dashboard');
  assert.equal(destination.params.name, 'Ada');
});
