import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VideosModule } from './modules/videos/videos.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ReactionsModule } from './modules/reactions/reactions.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { S3Module } from './shared/services/s3.module';
import { I18nModule } from './shared/services/i18n/i18n.module';
import { LanguageMiddleware } from './shared/middlewares/language.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import s3Config from './config/s3.config';
import { DataSourceOptions } from 'typeorm';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, s3Config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DataSourceOptions => {
        const config = configService.get<DataSourceOptions>('database');
        if (!config) {
          throw new Error('Database configuration not found');
        }
        return config;
      },
    }),
    AuthModule,
    UsersModule,
    VideosModule,
    CategoriesModule,
    TagsModule,
    CommentsModule,
    ReactionsModule,
    ChannelsModule,
    S3Module,
    SubscriptionsModule,
    I18nModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Применяем middleware ко всем маршрутам
    consumer.apply(LanguageMiddleware).forRoutes('*');
  }
}
