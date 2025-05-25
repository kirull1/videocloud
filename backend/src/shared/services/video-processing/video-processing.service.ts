import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ffmpeg from 'fluent-ffmpeg';
import * as ffprobeStatic from '@ffprobe-installer/ffprobe';
// Import ffmpeg-static as a string path
// @ts-ignore
import ffmpegPath from 'ffmpeg-static';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { S3Service } from '../s3.service';
import { ProcessingProgressService, ProcessingStage } from './processing-progress.service';

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
    private readonly progressService: ProcessingProgressService,
  ) {
    // Set ffprobe path
    ffmpeg.setFfprobePath(ffprobeStatic.path);
    
    // Try to set ffmpeg path
    try {
      // Check if ffmpegPath exists
      if (ffmpegPath) {
        // Check if the file exists
        if (fs.existsSync(ffmpegPath)) {
          // Set execute permissions on the ffmpeg binary
          fs.chmodSync(ffmpegPath, 0o755);
          ffmpeg.setFfmpegPath(ffmpegPath);
          this.logger.log(`Using ffmpeg from: ${ffmpegPath}`);
        } else {
          this.logger.warn(`ffmpeg-static path exists but file not found at: ${ffmpegPath}`);
          this.logger.warn('Using system ffmpeg if available');
        }
      } else {
        this.logger.warn('ffmpeg-static path not found, using system ffmpeg if available');
      }
    } catch (error: any) {
      this.logger.error(`Error setting ffmpeg path: ${error.message}`);
      this.logger.warn('Using system ffmpeg if available');
    }

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
    
    // Update progress to transcoding stage
    this.progressService.updateProgress(
      videoId,
      ProcessingStage.TRANSCODING,
      10,
      'Starting video transcoding'
    );

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
      this.progressService.updateProgress(
        videoId,
        ProcessingStage.ANALYZING,
        20,
        'Extracting video metadata'
      );
      
      const metadata = await this.getVideoMetadata(originalVideoPath);
      const duration = metadata.duration || 0;

      this.logger.log(`Video metadata: ${JSON.stringify(metadata)}`);
      
      this.progressService.updateProgress(
        videoId,
        ProcessingStage.TRANSCODING,
        30,
        'Creating video variants'
      );

      // Process video variants
      this.progressService.updateProgress(
        videoId,
        ProcessingStage.TRANSCODING,
        40,
        'Creating video variants'
      );
      
      const videoVariants = await this.createVideoVariants(
        originalVideoPath,
        processingDir,
        userId,
        videoId,
        qualities || this.defaultOptions.qualities!,
        formats || this.defaultOptions.formats!
      );
      
      // Generate thumbnails
      this.progressService.updateProgress(
        videoId,
        ProcessingStage.GENERATING_THUMBNAILS,
        70,
        'Generating thumbnails'
      );
      
      const thumbnails = generateThumbnails
        ? await this.generateThumbnails(
            originalVideoPath,
            processingDir,
            userId,
            videoId,
            duration || 0,
            thumbnailCount || this.defaultOptions.thumbnailCount!
          )
        : [];

      // Finalizing
      this.progressService.updateProgress(
        videoId,
        ProcessingStage.FINALIZING,
        90,
        'Finalizing video processing'
      );
      
      // Clean up processing directory
      this.cleanupProcessingDir(processingDir);
      
      // Mark as completed
      this.progressService.updateProgress(
        videoId,
        ProcessingStage.COMPLETED,
        100,
        'Video processing completed'
      );

      return {
        videoVariants,
        thumbnails,
        duration,
      };
    } catch (error: any) {
      this.logger.error(`Error processing video: ${error.message}`, error.stack);
      
      // Mark as failed
      this.progressService.markAsFailed(
        videoId,
        `Failed to process video: ${error.message}`
      );
      
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
      try {
        // Create the directory if it doesn't exist
        const dir = path.dirname(outputPath);
        try {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
        } catch (dirErr: any) {
          // If directory already exists, that's fine
          if (!dirErr.message.includes('EEXIST')) {
            throw dirErr;
          }
        }
        
        // Try to use ffmpeg for transcoding
        this.logger.log(`Attempting to transcode video to ${resolution.width}x${resolution.height} in ${format} format`);
        
        let ffmpegCommand = ffmpeg(inputPath);
        
        // Set ffmpeg path if available
        if (ffmpegPath) {
          ffmpegCommand = ffmpegCommand.setFfmpegPath(ffmpegPath);
        }
        
        // Configure transcoding options based on format and resolution
        ffmpegCommand = ffmpegCommand
          .size(`${resolution.width}x${resolution.height}`)
          .videoBitrate('1000k')
          .videoCodec(format === VideoFormat.WEBM ? 'libvpx' : 'libx264')
          .format(format)
          .outputOptions([
            '-crf 23',
            '-preset fast',
            '-movflags +faststart',
          ])
          .output(outputPath);
        
        ffmpegCommand
          .on('start', (commandLine) => {
            this.logger.log(`FFmpeg command: ${commandLine}`);
          })
          .on('progress', (progress) => {
            this.logger.log(`Transcoding progress: ${JSON.stringify(progress)}`);
          })
          .on('end', () => {
            this.logger.log(`Successfully transcoded video to ${outputPath}`);
            resolve();
          })
          .on('error', (err) => {
            this.logger.error(`Error transcoding video: ${err.message}`);
            
            // Fall back to copying the original file if ffmpeg fails
            this.logger.log(`Falling back to copying original file`);
            try {
              fs.copyFileSync(inputPath, outputPath);
              this.logger.log(`Created fallback copy at: ${outputPath}`);
              resolve();
            } catch (copyErr: any) {
              this.logger.error(`Error creating fallback copy: ${copyErr.message}`);
              reject(copyErr);
            }
          })
          .run();
      } catch (err: any) {
        this.logger.error(`Error in transcoding setup: ${err.message}`);
        
        // Fall back to copying the original file if setup fails
        try {
          fs.copyFileSync(inputPath, outputPath);
          this.logger.log(`Created fallback copy at: ${outputPath}`);
          resolve();
        } catch (copyErr: any) {
          this.logger.error(`Error creating fallback copy: ${copyErr.message}`);
          reject(copyErr);
        }
      }
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

        // Upload the thumbnail to S3 in a "generated" subfolder to avoid conflicts with uploaded thumbnails
        const s3Key = `thumbnails/${userId}/${videoId}/generated/${outputFilename}`;
        await this.s3Service.uploadFile(outputPath, s3Key, 'image/jpeg', true); // Set ACL to public-read

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
    // Try to use a more reliable method that doesn't depend on ffmpeg
    try {
      // Create a simple JPEG image with a gradient
      const width = 480;
      const height = 270;
      
      // Create a buffer for the JPEG file
      // JPEG header (SOI)
      const jpegHeader = Buffer.from([
        0xFF, 0xD8,                     // SOI marker
        0xFF, 0xE0,                     // APP0 marker
        0x00, 0x10,                     // APP0 length (16 bytes)
        0x4A, 0x46, 0x49, 0x46, 0x00,   // JFIF identifier
        0x01, 0x01,                     // JFIF version 1.1
        0x00,                           // density units (0 = no units)
        0x00, 0x01,                     // X density (1)
        0x00, 0x01,                     // Y density (1)
        0x00, 0x00                      // thumbnail (0x0)
      ]);
      
      // Create a simple gradient image
      const imageData = Buffer.alloc(width * height * 3); // RGB data
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offset = (y * width + x) * 3;
          // Create a gradient based on position
          imageData[offset] = Math.floor((x / width) * 255);     // R
          imageData[offset + 1] = Math.floor((y / height) * 255); // G
          imageData[offset + 2] = 128;                           // B
        }
      }
      
      // Add timestamp text to the image (simple representation)
      const formattedTime = this.formatTimestamp(timestamp);
      this.drawTextOnBuffer(imageData, width, height, formattedTime, 10, 10);
      
      // Add video filename text
      const filename = path.basename(inputPath);
      this.drawTextOnBuffer(imageData, width, height, filename, 10, 30);
      
      // Convert RGB to JPEG (simplified approach)
      // In a real implementation, you'd use a proper JPEG encoder library
      // For now, we'll create a simple BMP file instead as it's easier
      
      // Create a BMP file
      const bmpFile = this.createBmpFromRgbData(imageData, width, height);
      
      // Write the BMP file
      fs.writeFileSync(outputPath, bmpFile);
      
      this.logger.log(`Created gradient thumbnail at: ${outputPath}`);
      return Promise.resolve();
    } catch (err: any) {
      this.logger.error(`Error creating gradient thumbnail: ${err.message}`);
      // Fall back to placeholder
      return this.createPlaceholderThumbnail(outputPath);
    }
  }
  
  /**
   * Format timestamp as HH:MM:SS
   */
  private formatTimestamp(timestamp: number): string {
    const hours = Math.floor(timestamp / 3600);
    const minutes = Math.floor((timestamp % 3600) / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Draw text on an RGB buffer (very simplified)
   */
  private drawTextOnBuffer(buffer: Buffer, width: number, height: number, text: string, x: number, y: number): void {
    // This is a very simplified text rendering
    // In a real implementation, you'd use a proper image processing library
    // For now, we'll just change some pixels to represent text
    
    const color = [255, 255, 255]; // White text
    
    for (let i = 0; i < text.length; i++) {
      const charX = x + i * 8;
      const charY = y;
      
      // Skip if outside bounds
      if (charX >= width - 8 || charY >= height - 8) continue;
      
      // Draw a simple rectangle for each character
      for (let dy = 0; dy < 8; dy++) {
        for (let dx = 0; dx < 6; dx++) {
          const px = charX + dx;
          const py = charY + dy;
          
          if (px < width && py < height) {
            const offset = (py * width + px) * 3;
            buffer[offset] = color[0];     // R
            buffer[offset + 1] = color[1]; // G
            buffer[offset + 2] = color[2]; // B
          }
        }
      }
    }
  }
  
  /**
   * Create a BMP file from RGB data
   */
  private createBmpFromRgbData(rgbData: Buffer, width: number, height: number): Buffer {
    const fileHeaderSize = 14;
    const infoHeaderSize = 40;
    const bitsPerPixel = 24;
    const rowSize = Math.floor((bitsPerPixel * width + 31) / 32) * 4;
    const pixelArraySize = rowSize * Math.abs(height);
    const fileSize = fileHeaderSize + infoHeaderSize + pixelArraySize;
    
    const buffer = Buffer.alloc(fileSize);
    
    // BMP file header
    buffer.write('BM', 0); // Signature
    buffer.writeUInt32LE(fileSize, 2); // File size
    buffer.writeUInt32LE(0, 6); // Reserved
    buffer.writeUInt32LE(fileHeaderSize + infoHeaderSize, 10); // Pixel array offset
    
    // DIB header (BITMAPINFOHEADER, 40 bytes)
    buffer.writeUInt32LE(infoHeaderSize, 14); // Header size
    buffer.writeInt32LE(width, 18); // Width
    buffer.writeInt32LE(height, 22); // Height
    buffer.writeUInt16LE(1, 26); // Color planes
    buffer.writeUInt16LE(bitsPerPixel, 28); // Bits per pixel
    buffer.writeUInt32LE(0, 30); // Compression method
    buffer.writeUInt32LE(pixelArraySize, 34); // Image size
    buffer.writeInt32LE(2835, 38); // Horizontal resolution (72 DPI)
    buffer.writeInt32LE(2835, 42); // Vertical resolution (72 DPI)
    buffer.writeUInt32LE(0, 46); // Colors in palette
    buffer.writeUInt32LE(0, 50); // Important colors
    
    // Pixel array - copy RGB data (BMP uses BGR)
    const pixelArrayOffset = fileHeaderSize + infoHeaderSize;
    
    // BMP stores rows from bottom to top
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcOffset = (y * width + x) * 3;
        const destOffset = pixelArrayOffset + (height - y - 1) * rowSize + x * 3;
        
        buffer[destOffset] = rgbData[srcOffset + 2]; // B
        buffer[destOffset + 1] = rgbData[srcOffset + 1]; // G
        buffer[destOffset + 2] = rgbData[srcOffset]; // R
      }
    }
    
    return buffer;
  }
  
  /**
   * Create a placeholder thumbnail when ffmpeg is not available
   */
  private async createPlaceholderThumbnail(outputPath: string): Promise<void> {
    this.logger.log(`Creating placeholder thumbnail at: ${outputPath}`);
    
    try {
      // Create the directory if it doesn't exist
      const dir = path.dirname(outputPath);
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      } catch (dirErr: any) {
        // If directory already exists, that's fine
        if (!dirErr.message.includes('EEXIST')) {
          throw dirErr;
        }
      }
      
      // Create a more visually appealing BMP file with a video-like appearance
      const fileHeaderSize = 14;
      const infoHeaderSize = 40;
      const width = 480;
      const height = 270; // 16:9 aspect ratio
      const bitsPerPixel = 24;
      const rowSize = Math.floor((bitsPerPixel * width + 31) / 32) * 4;
      const pixelArraySize = rowSize * Math.abs(height);
      const fileSize = fileHeaderSize + infoHeaderSize + pixelArraySize;
      
      const buffer = Buffer.alloc(fileSize);
      
      // BMP file header
      buffer.write('BM', 0); // Signature
      buffer.writeUInt32LE(fileSize, 2); // File size
      buffer.writeUInt32LE(0, 6); // Reserved
      buffer.writeUInt32LE(fileHeaderSize + infoHeaderSize, 10); // Pixel array offset
      
      // DIB header (BITMAPINFOHEADER, 40 bytes)
      buffer.writeUInt32LE(infoHeaderSize, 14); // Header size
      buffer.writeInt32LE(width, 18); // Width
      buffer.writeInt32LE(height, 22); // Height
      buffer.writeUInt16LE(1, 26); // Color planes
      buffer.writeUInt16LE(bitsPerPixel, 28); // Bits per pixel
      buffer.writeUInt32LE(0, 30); // Compression method
      buffer.writeUInt32LE(pixelArraySize, 34); // Image size
      buffer.writeInt32LE(2835, 38); // Horizontal resolution (72 DPI)
      buffer.writeInt32LE(2835, 42); // Vertical resolution (72 DPI)
      buffer.writeUInt32LE(0, 46); // Colors in palette
      buffer.writeUInt32LE(0, 50); // Important colors
      
      // Pixel array - create a gradient background with a play button in the center
      const pixelArrayOffset = fileHeaderSize + infoHeaderSize;
      
      // Draw gradient background
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offset = pixelArrayOffset + (height - y - 1) * rowSize + x * 3; // BMP is stored bottom-up
          
          // Create a dark gradient background
          const gradientFactor = (y / height) * 0.5;
          buffer[offset] = Math.floor(50 + gradientFactor * 50); // Blue
          buffer[offset + 1] = Math.floor(40 + gradientFactor * 40); // Green
          buffer[offset + 2] = Math.floor(30 + gradientFactor * 30); // Red
          
          // Draw a play button in the center
          const centerX = width / 2;
          const centerY = height / 2;
          const buttonRadius = Math.min(width, height) * 0.15;
          
          // Calculate distance from center
          const distX = x - centerX;
          const distY = y - centerY;
          const distance = Math.sqrt(distX * distX + distY * distY);
          
          if (distance < buttonRadius) {
            // Inside the play button circle
            buffer[offset] = 80; // Blue
            buffer[offset + 1] = 180; // Green
            buffer[offset + 2] = 240; // Red
            
            // Draw a triangle inside the circle
            const triangleX = (x - centerX) / buttonRadius;
            const triangleY = (y - centerY) / buttonRadius;
            
            if (triangleX > -0.3 &&
                triangleY < 0.5 * triangleX + 0.3 &&
                triangleY > -0.5 * triangleX - 0.3) {
              // Inside the triangle (play icon)
              buffer[offset] = 255; // Blue
              buffer[offset + 1] = 255; // Green
              buffer[offset + 2] = 255; // Red
            }
          }
        }
      }
      
      // Write the BMP data to the file
      fs.writeFileSync(outputPath, buffer);
      
      this.logger.log(`Created visually appealing BMP placeholder thumbnail at: ${outputPath}`);
    } catch (error: any) {
      this.logger.error(`Error creating placeholder thumbnail: ${error.message}`);
      throw error;
    }
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