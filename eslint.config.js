import airbnbBase from 'eslint-config-airbnb-base';
import airbnbTypeScript from 'eslint-config-airbnb-typescript/base';
import airbnbHooks from 'eslint-config-airbnb/hooks';
import prettier from 'eslint-config-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import * as importPlugin from 'eslint-plugin-import';

// Safely extract import plugin rules
const importRules = importPlugin?.configs?.recommended?.rules ?? {};

export default [
  // Base config for all files
  {
    ignores: ['node_modules', 'build', 'coverage', 'tests/outputs'],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // ES2021 globals
        Array: 'readonly',
        ArrayBuffer: 'readonly',
        Boolean: 'readonly',
        DataView: 'readonly',
        Date: 'readonly',
        Error: 'readonly',
        EvalError: 'readonly',
        Float32Array: 'readonly',
        Float64Array: 'readonly',
        Function: 'readonly',
        Int8Array: 'readonly',
        Int16Array: 'readonly',
        Int32Array: 'readonly',
        Intl: 'readonly',
        JSON: 'readonly',
        Map: 'readonly',
        Math: 'readonly',
        Number: 'readonly',
        Object: 'readonly',
        Promise: 'readonly',
        Proxy: 'readonly',
        RangeError: 'readonly',
        ReferenceError: 'readonly',
        Reflect: 'readonly',
        RegExp: 'readonly',
        Set: 'readonly',
        String: 'readonly',
        Symbol: 'readonly',
        SyntaxError: 'readonly',
        TypeError: 'readonly',
        URIError: 'readonly',
        Uint8Array: 'readonly',
        Uint8ClampedArray: 'readonly',
        Uint16Array: 'readonly',
        Uint32Array: 'readonly',
        WeakMap: 'readonly',
        WeakSet: 'readonly',
        // Additional globals
        BigInt: true,
        console: true,
        WebAssembly: true,
        // Browser globals
        window: true,
        document: true,
        globalThis: true,
      },
    },
  },

  // TypeScript files config
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
      ...airbnbBase.rules,
      ...airbnbTypeScript.rules,
      ...airbnbHooks.rules,
      ...tseslint.configs.recommended.rules,
      ...importRules,
      'no-underscore-dangle': [
        'error',
        {
          allowAfterThis: true,
          allowAfterSuper: true,
          allowAfterThisConstructor: true,
        },
      ],
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // Library source files config
  {
    files: ['./src/lib/**/*.ts'],
    rules: {
      'import/prefer-default-export': 'off',
    },
  },

  // Test files config
  {
    files: ['./tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'global-require': 'off',
    },
  },
];
