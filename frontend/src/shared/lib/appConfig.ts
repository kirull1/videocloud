interface AppConfig {
  apiUrl: string;
}

export const appConfig: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || '/api'
}; 