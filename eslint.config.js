/**
 * ESLint configuration for VideoCloud project
 *
 * This configuration is based on the Airbnb JavaScript Style Guide
 * and provides consistent code style across the entire project.
 */

import airbnbBase from 'eslint-config-airbnb-base'
import airbnbTypescript from 'eslint-config-airbnb-typescript'
import pluginImport from 'eslint-plugin-import'
import pluginVue from 'eslint-plugin-vue'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

export default [
  // Common configuration for all files
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/.temp/**',
      '**/.tmp/**',
      '**/build/**',
    ],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // JavaScript files
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
    },
    plugins: {
      import: pluginImport,
    },
    rules: {
      ...airbnbBase.rules,
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'comma-dangle': ['error', 'always-multiline'],
      'import/prefer-default-export': 'off',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'max-len': [
        'error',
        { code: 100, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true },
      ],
      'no-param-reassign': ['error', { props: false }],
      'no-underscore-dangle': 'off',
      'arrow-parens': ['error', 'as-needed'],
      'object-curly-newline': ['error', { consistent: true }],
      'function-paren-newline': ['error', 'consistent'],
    },
  },

  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.json', './frontend/tsconfig.json', './backend/tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: pluginImport,
    },
    rules: {
      ...airbnbBase.rules,
      ...airbnbTypescript.rules,
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'comma-dangle': ['error', 'always-multiline'],
      'import/prefer-default-export': 'off',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'max-len': [
        'error',
        { code: 100, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true },
      ],
      'no-param-reassign': ['error', { props: false }],
      'no-underscore-dangle': 'off',
      'arrow-parens': ['error', 'as-needed'],
      'object-curly-newline': ['error', { consistent: true }],
      'function-paren-newline': ['error', 'consistent'],
      '@typescript-eslint/semi': ['error', 'never'],
      '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: true },
      ],
    },
  },

  // Vue files
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsparser,
        ecmaVersion: 2023,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      vue: pluginVue,
    },
    processor: pluginVue.processors['.vue'],
    rules: {
      ...pluginVue.configs.recommended.rules,
      'vue/html-indent': ['error', 2],
      'vue/html-quotes': ['error', 'double'],
      'vue/max-attributes-per-line': ['error', { singleline: 3, multiline: 1 }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/no-v-html': 'error',
      'vue/require-default-prop': 'error',
      'vue/require-explicit-emits': 'error',
      'vue/no-unused-vars': 'error',
      'vue/html-self-closing': [
        'error',
        { html: { void: 'always', normal: 'always', component: 'always' } },
      ],
      'vue/multi-word-component-names': 'off',
    },
  },
]
