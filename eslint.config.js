// @ts-check
import { globalIgnores } from 'eslint/config'
import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

// Vue specific imports
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-skip-formatting'

// Testing imports
import pluginVitest from '@vitest/eslint-plugin'
import pluginPlaywright from 'eslint-plugin-playwright'
import pluginJest from 'eslint-plugin-jest'

// Common base configuration
const baseConfig = [
  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**', '**/.temp/**', '**/.tmp/**'],
  },
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
]

// Backend specific configuration
export const backendConfig = tseslint.config(
  ...baseConfig,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    ...pluginJest.configs.recommended,
  }
)

// Frontend specific configuration
export const frontendConfig = defineConfigWithVueTs(
  {
    name: 'frontend/files-to-lint',
    files: ['frontend/**/*.{ts,mts,tsx,vue}'],
  },
  
  globalIgnores,
  
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  
  {
    ...pluginVitest.configs.recommended,
    files: ['frontend/src/**/__tests__/*'],
  },
  
  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['frontend/e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
  
  skipFormatting,
)

// Default export combines both configurations
export default [
  ...backendConfig,
  ...frontendConfig,
]
