import airbnbBase from 'eslint-config-airbnb-base';
import airbnbTypeScript from 'eslint-config-airbnb-typescript/base.js';
import airbnbHooks from 'eslint-config-airbnb/hooks';
import prettier from 'eslint-config-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import * as importPlugin from 'eslint-plugin-import';

const importRules = importPlugin?.configs?.recommended?.rules ?? {};

export default [
  // Base configuration for all files
  {
    ignores: ['node_modules', 'build', 'coverage', 'tests/outputs'],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // Common globals
        console: true,
        globalThis: true,
        // Browser globals
        window: true,
        document: true,
        // ES globals
        Array: 'readonly',
        BigInt: 'readonly',
        Boolean: 'readonly',
        Date: 'readonly',
        Error: 'readonly',
        Function: 'readonly',
        JSON: 'readonly',
        Map: 'readonly',
        Math: 'readonly',
        Number: 'readonly',
        Object: 'readonly',
        Promise: 'readonly',
        Proxy: 'readonly',
        Reflect: 'readonly',
        RegExp: 'readonly',
        Set: 'readonly',
        String: 'readonly',
        Symbol: 'readonly',
        WeakMap: 'readonly',
        WeakSet: 'readonly',
        // TypedArrays
        ArrayBuffer: 'readonly',
        DataView: 'readonly',
        Float32Array: 'readonly',
        Float64Array: 'readonly',
        Int8Array: 'readonly',
        Int16Array: 'readonly',
        Int32Array: 'readonly',
        Uint8Array: 'readonly',
        Uint8ClampedArray: 'readonly',
        Uint16Array: 'readonly',
        Uint32Array: 'readonly',
      },
    },
  },

  // TypeScript configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
        },
      },
    },
    rules: {
      // Extend base configurations
      ...airbnbBase.rules,
      ...airbnbTypeScript.rules,
      ...airbnbHooks.rules,
      ...tseslint.configs.recommended.rules,
      ...importRules,
      ...prettier.rules,

      // TypeScript specific overrides
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Custom rule configurations
      'no-underscore-dangle': ['error', {
        allowAfterThis: true,
        allowAfterSuper: true,
        allowAfterThisConstructor: true,
      }],
      'no-restricted-imports': 'off',
    },
  },

  // Library source files configuration
  {
    files: ['./src/lib/**/*.ts'],
    rules: {
      'import/prefer-default-export': 'off',
    },
  },

  // Test files configuration
  {
    files: ['./tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'global-require': 'off',
    },
  },
];
