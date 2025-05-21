import { Module } from '@nestjs/common';
import { VideoProcessingService } from './video-processing.service';
import { S3Module } from '../s3.module';

@Module({
  imports: [S3Module],
  providers: [VideoProcessingService],
  exports: [VideoProcessingService],
})
export class VideoProcessingModule {}