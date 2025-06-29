import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Video } from '../../entities/video.entity';
import { User } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';
import { Tag } from '../../entities/tag.entity';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { S3Module } from '../../shared/services/s3.module';
import { VideoProcessingModule } from '../../shared/services/video-processing/video-processing.module';
import { VideoPlayerModule } from '../../shared/services/video-player/video-player.module';
import { I18nModule } from '../../shared/services/i18n/i18n.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, User, Category, Tag]),
    MulterModule.register({
      dest: './uploads/videos',
    }),
    S3Module,
    VideoProcessingModule,
    VideoPlayerModule,
    I18nModule,
  ],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
