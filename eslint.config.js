import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import prettierConfig from 'eslint-config-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist', '.next', 'coverage', 'ml-data/**', 'public/**', 'next-env.d.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginReact.configs.flat.recommended,
  eslintPluginReact.configs.flat['jsx-runtime'],
  { settings: { react: { version: 'detect' } } },
  reactHooks.configs.flat.recommended,
  nextPlugin.configs['core-web-vitals'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
    },
    rules: {
      'no-console': ['error', { allow: ['debug', 'warn', 'error'] }],
      'no-debugger': 'error',
    },
  },
  {
    // Code that runs in Node: the signaling servers, command-line scripts and tool configs.
    files: ['*.{js,mjs,cjs,ts,mts}', 'scripts/**', 'src/server/**'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/workers/**'],
    languageOptions: { globals: globals.worker },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { import: eslintPluginImport },
    languageOptions: {
      parserOptions: {
        // Type information for the few rules below that need it.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      'no-use-before-define': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      // A rejected promise nobody handles fails silently; handle it or mark it with `void`.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-named-as-default': 'error',
      'import/no-unresolved': 'warn',
      'react/prop-types': 'off',
      'react/jsx-pascal-case': 'warn',
    },
  },
  {
    // Board pieces are small pre-optimised PNGs, all preloaded and shown at a fixed size, so
    // next/image would only add a loader round trip per piece.
    files: ['src/views/PikachuView/**', 'src/components/AppDialog/PikachuInstructionDialog.tsx'],
    rules: { '@next/next/no-img-element': 'off' },
  },
  // Last, so formatting is left to Prettier.
  prettierConfig,
];
