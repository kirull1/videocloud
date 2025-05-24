/**
 * Application configuration
 */

const origin = String(process.env.CORS_ORIGIN).split(",").map(el => el.trim());

export const appConfig = {
  name: 'VideoCloud API',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: 'api',
  cors: {
    allowedHeaders: '*',
    methods: '*',
    enabled: Boolean(process.env.CORS_ENABLED || true),
    origin: origin.length === 0 ? '*' : origin,
    credentials: true,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
