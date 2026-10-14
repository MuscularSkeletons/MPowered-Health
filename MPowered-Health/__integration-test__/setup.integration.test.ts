/**
 * GLOBAL TEST SETUP FOR INTEGRATION TESTS
 *
 * Makes the test environment act like a real Expo/React Native app
 * without needing a device.
 *
 */

import { configure } from '@testing-library/react-native';

// Expo font
jest.mock('expo-font', () => ({
  useFonts: () => [true],
  loadAsync: jest.fn(),
}));

// Expo splash screen
jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}));

// expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }: any) => children,
}));

// Safe area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }),
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
}));

// Expo device
jest.mock('expo-device', () => ({
  isDevice: false,
}));

// AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Global fetch
globalThis.fetch = jest.fn();

// Reduce console noise
globalThis.console.warn = jest.fn();
globalThis.console.error = jest.fn();