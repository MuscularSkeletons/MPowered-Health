// This file defines the linting rules used to keep the project code consistent.
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

// Apply Expo's recommended rules first, then list project-specific exceptions.
module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  }
]);
