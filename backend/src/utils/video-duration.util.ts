import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffprobeStatic from '@ffprobe-installer/ffprobe';

/**
 * Utility class for calculating video duration
 */
export class VideoDurationUtil {
  private static readonly logger = new Logger(VideoDurationUtil.name);

  /**
   * Calculate the duration of a video from a buffer
   * @param buffer The video buffer
   * @param mimeType The video mime type
   * @returns The duration in seconds
   */
  public static async calculateDuration(buffer: Buffer, mimeType: string): Promise<number> {
    try {
      // Create a custom temporary directory within the project
      const tempDir = path.join(process.cwd(), 'temp');
      
      // Create the directory if it doesn't exist
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFilePath = path.join(tempDir, `temp-video-${Date.now()}.${this.getExtensionFromMimeType(mimeType)}`);
      
      this.logger.log(`Creating temporary file at: ${tempFilePath}`);
      
      // Write the buffer to the temporary file
      fs.writeFileSync(tempFilePath, buffer);
      
      // Ensure the file has proper permissions
      fs.chmodSync(tempFilePath, 0o666);
      
      this.logger.log(`Temporary file created and permissions set`);
      
      // Calculate the duration using fluent-ffmpeg with the installed ffprobe path
      return new Promise<number>((resolve, reject) => {
        // Set execute permission on the ffprobe executable
        try {
          this.logger.log(`Setting execute permission on ffprobe: ${ffprobeStatic.path}`);
          fs.chmodSync(ffprobeStatic.path, 0o755); // rwxr-xr-x
        } catch (error: any) {
          this.logger.warn(`Failed to set execute permission on ffprobe: ${error.message}`);
        }
        
        // Set the ffprobe path from the ffprobe-installer package
        ffmpeg.setFfprobePath(ffprobeStatic.path);
        
        this.logger.log(`Using ffprobe from path: ${ffprobeStatic.path}`);
        
        ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
          try {
            // Clean up the temporary file regardless of success or failure
            try {
              fs.unlinkSync(tempFilePath);
              this.logger.log(`Temporary file removed: ${tempFilePath}`);
            } catch (cleanupError: any) {
              this.logger.warn(`Failed to remove temporary file: ${cleanupError.message}`);
            }
            
            // Handle any errors from ffprobe
            if (err) {
              this.logger.error(`ffprobe error: ${err.message}`);
              return reject(new Error(`Failed to get video metadata: ${err.message}`));
            }
            
            // Extract duration from metadata
            if (metadata && metadata.format && metadata.format.duration) {
              const duration = Math.round(metadata.format.duration);
              this.logger.log(`Video duration calculated: ${duration} seconds`);
              resolve(duration);
            } else {
              this.logger.error('No duration found in video metadata');
              reject(new Error('No duration found in video metadata'));
            }
          } catch (error: any) {
            this.logger.error(`Error in ffprobe callback: ${error.message}`);
            reject(error);
          }
        });
      });
    } catch (error: any) {
      this.logger.error(`Error calculating video duration: ${error.message}`, error.stack);
      throw new Error(`Failed to calculate video duration: ${error.message}`);
    }
  }

  /**
   * Get the file extension from a mime type
   * @param mimeType The mime type
   * @returns The file extension
   */
  private static getExtensionFromMimeType(mimeType: string): string {
    switch (mimeType) {
      case 'video/mp4':
        return 'mp4';
      case 'video/webm':
        return 'webm';
      case 'video/ogg':
        return 'ogg';
      case 'video/quicktime':
        return 'mov';
      default:
        return 'mp4'; // Default to mp4
    }
  }
}