import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from '@config/app.config';
import { createLogger } from '@utils/logger';
import { json, urlencoded } from 'express';

const logger = createLogger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply global prefix
  app.setGlobalPrefix(appConfig.apiPrefix);

  // Configure CORS if enabled
  if (appConfig.cors.enabled) {
    app.enableCors({
      origin: appConfig.cors.origin,
    });
  }

  // Configure body parser limits for large file uploads
  app.use(json({ limit: '500mb' }));
  app.use(urlencoded({ extended: true, limit: '500mb' }));

  // Start the server
  await app.listen(appConfig.port);

  logger.info(
    `${appConfig.name} v${appConfig.version} is running on port ${appConfig.port} in ${appConfig.environment} mode`,
  );
}

bootstrap().catch((error) => {
  logger.error('Failed to start application', error);
  process.exit(1);
});
