import { Injectable, Logger } from '@nestjs/common';

export enum ProcessingStage {
  UPLOADING = 'uploading',
  ANALYZING = 'analyzing',
  TRANSCODING = 'transcoding',
  GENERATING_THUMBNAILS = 'generating_thumbnails',
  FINALIZING = 'finalizing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface ProcessingProgress {
  videoId: string;
  stage: ProcessingStage;
  progress: number; // 0-100
  message?: string;
  error?: string;
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

@Injectable()
export class ProcessingProgressService {
  private readonly logger = new Logger(ProcessingProgressService.name);
  private readonly progressMap = new Map<string, ProcessingProgress>();

  /**
   * Initialize progress tracking for a video
   */
  initProgress(videoId: string): ProcessingProgress {
    const now = new Date();
    const progress: ProcessingProgress = {
      videoId,
      stage: ProcessingStage.UPLOADING,
      progress: 0,
      startedAt: now,
      updatedAt: now,
    };
    
    this.progressMap.set(videoId, progress);
    this.logger.log(`Initialized progress tracking for video ${videoId}`);
    
    return progress;
  }

  /**
   * Update progress for a video
   */
  updateProgress(
    videoId: string, 
    stage: ProcessingStage, 
    progress: number, 
    message?: string
  ): ProcessingProgress {
    const existingProgress = this.progressMap.get(videoId);
    
    if (!existingProgress) {
      return this.initProgress(videoId);
    }
    
    const updatedProgress: ProcessingProgress = {
      ...existingProgress,
      stage,
      progress: Math.min(Math.max(0, progress), 100), // Ensure progress is between 0-100
      message,
      updatedAt: new Date(),
    };
    
    // If stage is completed or failed, set completedAt
    if (stage === ProcessingStage.COMPLETED || stage === ProcessingStage.FAILED) {
      updatedProgress.completedAt = new Date();
    }
    
    this.progressMap.set(videoId, updatedProgress);
    this.logger.log(`Updated progress for video ${videoId}: ${stage} ${progress}%`);
    
    return updatedProgress;
  }

  /**
   * Mark processing as failed
   */
  markAsFailed(videoId: string, error: string): ProcessingProgress {
    const existingProgress = this.progressMap.get(videoId);
    
    if (!existingProgress) {
      const progress = this.initProgress(videoId);
      progress.stage = ProcessingStage.FAILED;
      progress.error = error;
      progress.completedAt = new Date();
      this.progressMap.set(videoId, progress);
      return progress;
    }
    
    const updatedProgress: ProcessingProgress = {
      ...existingProgress,
      stage: ProcessingStage.FAILED,
      error,
      updatedAt: new Date(),
      completedAt: new Date(),
    };
    
    this.progressMap.set(videoId, updatedProgress);
    this.logger.error(`Processing failed for video ${videoId}: ${error}`);
    
    return updatedProgress;
  }

  /**
   * Get progress for a video
   */
  getProgress(videoId: string): ProcessingProgress | undefined {
    return this.progressMap.get(videoId);
  }

  /**
   * Remove progress tracking for a video
   */
  removeProgress(videoId: string): void {
    this.progressMap.delete(videoId);
    this.logger.log(`Removed progress tracking for video ${videoId}`);
  }

  /**
   * Get all active processing videos
   */
  getAllActiveProcessing(): ProcessingProgress[] {
    return Array.from(this.progressMap.values())
      .filter(p => p.stage !== ProcessingStage.COMPLETED && p.stage !== ProcessingStage.FAILED);
  }
}