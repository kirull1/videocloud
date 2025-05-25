import { Module } from '@nestjs/common';
import { VideoProcessingService } from './video-processing.service';
import { ProcessingProgressService } from './processing-progress.service';
import { S3Service } from '../s3.service';

@Module({
  providers: [
    VideoProcessingService,
    ProcessingProgressService,
    S3Service,
  ],
  exports: [
    VideoProcessingService,
    ProcessingProgressService,
  ],
})
export class VideoProcessingModule {}