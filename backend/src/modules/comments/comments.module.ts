import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from '../../entities/comment.entity';
import { Video } from '../../entities/video.entity';
import { I18nModule } from '../../shared/services/i18n/i18n.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Video]),
    I18nModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}