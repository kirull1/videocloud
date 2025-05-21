import { Module } from '@nestjs/common';
import { VideoPlayerService } from './video-player.service';
import { S3Module } from '../s3.module';

@Module({
  imports: [S3Module],
  providers: [VideoPlayerService],
  exports: [VideoPlayerService],
})
export class VideoPlayerModule {}