import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ffmpeg from 'fluent-ffmpeg';
import * as ffprobeStatic from '@ffprobe-installer/ffprobe';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { S3Service } from '../s3.service';

export enum VideoQuality {
  HIGH = '720p',
  MEDIUM = '480p',
  LOW = '360p',
}

export enum VideoFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
}

export interface ProcessingOptions {
  generateThumbnails?: boolean;
  thumbnailCount?: number;
  qualities?: VideoQuality[];
  formats?: VideoFormat[];
}

export interface ProcessingResult {
  videoVariants: {
    quality: VideoQuality;
    format: VideoFormat;
    path: string;
    size: number;
  }[];
  thumbnails: {
    path: string;
    timestamp: number;
  }[];
  duration: number;
}

@Injectable()
export class VideoProcessingService {
  private readonly logger = new Logger(VideoProcessingService.name);
  private readonly tempDir: string;
  private readonly defaultOptions: ProcessingOptions = {
    generateThumbnails: true,
    thumbnailCount: 3,
    qualities: [VideoQuality.HIGH, VideoQuality.MEDIUM, VideoQuality.LOW],
    formats: [VideoFormat.MP4, VideoFormat.WEBM],
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {
    // Set ffprobe path
    ffmpeg.setFfprobePath(ffprobeStatic.path);

    // Create a temporary directory for video processing
    this.tempDir = path.join(os.tmpdir(), 'videocloud-processing');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    this.logger.log(`Video processing service initialized with temp dir: ${this.tempDir}`);
  }

  /**
   * Process a video file from S3, creating different quality variants and thumbnails
   */
  async processVideo(
    s3Key: string,
    userId: string,
    videoId: string,
    options: ProcessingOptions = {},
  ): Promise<ProcessingResult> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const { generateThumbnails, thumbnailCount, qualities, formats } = mergedOptions;

    this.logger.log(`Starting video processing for key: ${s3Key}`);

    try {
      // Create a unique processing directory for this video
      const processingDir = path.join(this.tempDir, videoId);
      if (!fs.existsSync(processingDir)) {
        fs.mkdirSync(processingDir, { recursive: true });
      }

      // Download the original video from S3
      const originalVideoPath = path.join(processingDir, 'original.mp4');
      await this.downloadFromS3(s3Key, originalVideoPath);

      // Set execute permission on the file to ensure it can be read by ffmpeg
      fs.chmodSync(originalVideoPath, 0o644);

      // Get video metadata
      const metadata = await this.getVideoMetadata(originalVideoPath);
      const duration = metadata.duration || 0;

      this.logger.log(`Video metadata: ${JSON.stringify(metadata)}`);

      // Process video variants and thumbnails in parallel
      const [videoVariants, thumbnails] = await Promise.all([
        this.createVideoVariants(
          originalVideoPath,
          processingDir,
          userId,
          videoId,
          qualities || this.defaultOptions.qualities!,
          formats || this.defaultOptions.formats!
        ),
        generateThumbnails
          ? this.generateThumbnails(
              originalVideoPath,
              processingDir,
              userId,
              videoId,
              duration || 0,
              thumbnailCount || this.defaultOptions.thumbnailCount!
            )
          : Promise.resolve([]),
      ]);

      // Clean up processing directory
      this.cleanupProcessingDir(processingDir);

      return {
        videoVariants,
        thumbnails,
        duration,
      };
    } catch (error: any) {
      this.logger.error(`Error processing video: ${error.message}`, error.stack);
      throw new Error(`Failed to process video: ${error.message}`);
    }
  }

  /**
   * Download a file from S3 to the local filesystem
   */
  private async downloadFromS3(s3Key: string, localPath: string): Promise<void> {
    this.logger.log(`Downloading file from S3: ${s3Key} to ${localPath}`);

    try {
      const fileStream = await this.s3Service.getFileStream(s3Key);
      const writeStream = fs.createWriteStream(localPath);

      return new Promise((resolve, reject) => {
        fileStream.pipe(writeStream);
        writeStream.on('finish', () => {
          this.logger.log(`File downloaded successfully: ${localPath}`);
          resolve();
        });
        writeStream.on('error', (err) => {
          this.logger.error(`Error writing file: ${err.message}`);
          reject(err);
        });
      });
    } catch (error: any) {
      this.logger.error(`Error downloading file from S3: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get video metadata using ffprobe
   */
  private async getVideoMetadata(filePath: string): Promise<{ duration: number; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          this.logger.error(`Error getting video metadata: ${err.message}`);
          return reject(err);
        }

        const duration = metadata.format.duration || 0;
        const videoStream = metadata.streams.find((stream) => stream.codec_type === 'video');
        const width = videoStream?.width || 0;
        const height = videoStream?.height || 0;

        resolve({ duration, width, height });
      });
    });
  }

  /**
   * Create different quality and format variants of the video
   */
  private async createVideoVariants(
    inputPath: string,
    processingDir: string,
    userId: string,
    videoId: string,
    qualities: VideoQuality[],
    formats: VideoFormat[],
  ): Promise<
    {
      quality: VideoQuality;
      format: VideoFormat;
      path: string;
      size: number;
    }[]
  > {
    this.logger.log(`Creating video variants for ${inputPath}`);
    const variants: {
      quality: VideoQuality;
      format: VideoFormat;
      path: string;
      size: number;
    }[] = [];

    // Process each quality and format combination
    for (const quality of qualities) {
      for (const format of formats) {
        try {
          const outputFilename = `${videoId}_${quality}.${format}`;
          const outputPath = path.join(processingDir, outputFilename);

          // Get resolution based on quality
          const resolution = this.getResolutionForQuality(quality);

          // Transcode the video
          await this.transcodeVideo(inputPath, outputPath, resolution, format);

          // Upload the transcoded video to S3
          const s3Key = `videos/${userId}/${videoId}/${outputFilename}`;
          await this.s3Service.uploadFile(outputPath, s3Key);

          // Get file size
          const stats = fs.statSync(outputPath);

          variants.push({
            quality,
            format,
            path: s3Key,
            size: stats.size,
          });

          this.logger.log(`Created ${quality} ${format} variant: ${s3Key}`);
        } catch (error: any) {
          this.logger.error(`Error creating ${quality} ${format} variant: ${error.message}`);
          // Continue with other variants even if one fails
        }
      }
    }

    return variants;
  }

  /**
   * Transcode a video to a specific resolution and format
   */
  private async transcodeVideo(
    inputPath: string,
    outputPath: string,
    resolution: { width: number; height: number },
    format: VideoFormat,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath)
        .size(`${resolution.width}x${resolution.height}`)
        .autopad()
        .outputOptions('-crf 23')
        .outputOptions('-preset medium');

      // Add format-specific options
      if (format === VideoFormat.MP4) {
        command = command
          .outputOptions('-c:v libx264')
          .outputOptions('-c:a aac')
          .outputOptions('-movflags +faststart');
      } else if (format === VideoFormat.WEBM) {
        command = command
          .outputOptions('-c:v libvpx-vp9')
          .outputOptions('-c:a libopus');
      }

      command
        .output(outputPath)
        .on('end', () => {
          this.logger.log(`Transcoding completed: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.error(`Transcoding error: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Generate thumbnails at different timestamps
   */
  private async generateThumbnails(
    inputPath: string,
    processingDir: string,
    userId: string,
    videoId: string,
    duration: number,
    count: number,
  ): Promise<{ path: string; timestamp: number }[]> {
    this.logger.log(`Generating ${count} thumbnails for ${inputPath}`);
    const thumbnails: { path: string; timestamp: number }[] = [];

    // Calculate timestamps for thumbnails (evenly distributed)
    const timestamps: number[] = [];
    if (duration > 0) {
      // Skip the first and last 10% of the video
      const usableDuration = duration * 0.8;
      const startTime = duration * 0.1;

      for (let i = 0; i < count; i++) {
        const timestamp = startTime + (i * usableDuration) / (count - 1);
        timestamps.push(timestamp);
      }
    } else {
      // If duration is unknown, use fixed timestamps
      for (let i = 0; i < count; i++) {
        timestamps.push(i * 30); // Every 30 seconds
      }
    }

    // Generate each thumbnail
    for (let i = 0; i < timestamps.length; i++) {
      try {
        const timestamp = timestamps[i];
        const outputFilename = `${videoId}_thumbnail_${i}.jpg`;
        const outputPath = path.join(processingDir, outputFilename);

        await this.generateThumbnail(inputPath, outputPath, timestamp);

        // Upload the thumbnail to S3
        const s3Key = `thumbnails/${userId}/${videoId}/${outputFilename}`;
        await this.s3Service.uploadFile(outputPath, s3Key, 'image/jpeg');

        thumbnails.push({
          path: s3Key,
          timestamp,
        });

        this.logger.log(`Generated thumbnail at ${timestamp}s: ${s3Key}`);
      } catch (error: any) {
        this.logger.error(`Error generating thumbnail: ${error.message}`);
        // Continue with other thumbnails even if one fails
      }
    }

    return thumbnails;
  }

  /**
   * Generate a single thumbnail at a specific timestamp
   */
  private async generateThumbnail(inputPath: string, outputPath: string, timestamp: number): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '640x360',
        })
        .on('end', () => {
          this.logger.log(`Thumbnail generated: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.error(`Thumbnail generation error: ${err.message}`);
          reject(err);
        });
    });
  }

  /**
   * Get resolution based on quality
   */
  private getResolutionForQuality(quality: VideoQuality): { width: number; height: number } {
    switch (quality) {
      case VideoQuality.HIGH:
        return { width: 1280, height: 720 };
      case VideoQuality.MEDIUM:
        return { width: 854, height: 480 };
      case VideoQuality.LOW:
        return { width: 640, height: 360 };
      default:
        return { width: 854, height: 480 };
    }
  }

  /**
   * Clean up the processing directory
   */
  private cleanupProcessingDir(processingDir: string): void {
    try {
      if (fs.existsSync(processingDir)) {
        const files = fs.readdirSync(processingDir);
        for (const file of files) {
          fs.unlinkSync(path.join(processingDir, file));
        }
        fs.rmdirSync(processingDir);
      }
      this.logger.log(`Cleaned up processing directory: ${processingDir}`);
    } catch (error: any) {
      this.logger.error(`Error cleaning up processing directory: ${error.message}`);
      // Don't throw, just log the error
    }
  }
}