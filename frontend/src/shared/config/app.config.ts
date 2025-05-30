/**
 * Application configuration for the frontend
 */
export const appConfig = {
  name: 'VideoCloud',
  version: '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  features: {
    darkMode: true,
    analytics: import.meta.env.MODE === 'production',
    notifications: true,
  },
  ui: {
    theme: 'light',
    animationsEnabled: true,
    defaultLanguage: 'en',
  },
}
