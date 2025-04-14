/**
 * Application configuration
 */
export const appConfig = {
  name: 'VideoCloud API',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: 'api',
  cors: {
    enabled: true,
    origin: process.env.CORS_ORIGIN || '*',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
