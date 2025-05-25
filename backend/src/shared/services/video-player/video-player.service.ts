import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../s3.service';
import * as path from 'path';

export interface StreamingOptions {
  format?: 'hls' | 'dash' | 'mp4';
  quality?: 'auto' | 'high' | 'medium' | 'low';
  startTime?: number;
}

export interface StreamingResponse {
  url: string;
  format: string;
  mimeType: string;
  duration: number;
  qualities: {
    label: string;
    url: string;
    width: number;
    height: number;
  }[];
}

@Injectable()
export class VideoPlayerService {
  private readonly logger = new Logger(VideoPlayerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {
    this.logger.log('VideoPlayerService initialized');
  }

  /**
   * Get streaming information for a video
   * @param videoId The ID of the video
   * @param userId The ID of the user requesting the video
   * @param s3Key The S3 key of the original video
   * @param options Streaming options
   * @returns Streaming information
   */
  async getStreamingInfo(
    videoId: string,
    userId: string,
    s3Key: string,
    duration: number,
    options: StreamingOptions = {},
  ): Promise<StreamingResponse> {
    this.logger.log(`Getting streaming info for video ${videoId} with options: ${JSON.stringify(options)}`);

    const { format = 'mp4', quality = 'auto' } = options;
    
    try {
      // Get the base path for the processed video variants
      const basePath = `videos/${userId}/${videoId}`;
      
      // Define quality variants
      const qualities = [
        { label: 'High (720p)', width: 1280, height: 720, key: `${basePath}/${videoId}_720p.${format === 'mp4' ? 'mp4' : 'webm'}` },
        { label: 'Medium (480p)', width: 854, height: 480, key: `${basePath}/${videoId}_480p.${format === 'mp4' ? 'mp4' : 'webm'}` },
        { label: 'Low (360p)', width: 640, height: 360, key: `${basePath}/${videoId}_360p.${format === 'mp4' ? 'mp4' : 'webm'}` },
      ];
      
      // Get signed URLs for each quality variant
      const qualityUrls = await Promise.all(
        qualities.map(async (q) => {
          try {
            const url = await this.s3Service.getSignedUrl(q.key);
            return {
              label: q.label,
              url,
              width: q.width,
              height: q.height,
            };
          } catch (error: any) {
            this.logger.warn(`Failed to get signed URL for quality variant ${q.key}: ${error.message}`);
            return null;
          }
        }),
      );
      
      // Filter out null values (failed to get signed URL)
      const availableQualities = qualityUrls.filter((q): q is { label: string; url: string; width: number; height: number } => q !== null);
      
      // If no transcoded variants are available, fall back to the original video
      if (availableQualities.length === 0) {
        this.logger.warn(`No transcoded variants available for video ${videoId}, falling back to original`);
        
        try {
          // Get a signed URL for the original video
          const originalUrl = await this.s3Service.getSignedUrl(s3Key);
          
          // Create a single quality option with the original video
          return {
            url: originalUrl,
            format: path.extname(s3Key).replace('.', '') || 'mp4',
            mimeType: format === 'mp4' ? 'video/mp4' : 'video/webm',
            duration,
            qualities: [{
              label: 'Original',
              url: originalUrl,
              width: 1280, // Assume HD, doesn't really matter
              height: 720,
            }],
          };
        } catch (error: any) {
          this.logger.error(`Failed to get signed URL for original video ${s3Key}: ${error.message}`);
          throw new NotFoundException('Video file not available');
        }
      }
      
      // Determine which quality to use based on the requested quality
      let selectedQuality;
      if (quality === 'auto') {
        // Use the highest quality available
        selectedQuality = availableQualities[0];
      } else if (quality === 'high') {
        selectedQuality = availableQualities.find(q => q.label.includes('720p')) || availableQualities[0];
      } else if (quality === 'medium') {
        selectedQuality = availableQualities.find(q => q.label.includes('480p')) || availableQualities[0];
      } else if (quality === 'low') {
        selectedQuality = availableQualities.find(q => q.label.includes('360p')) || availableQualities[0];
      } else {
        selectedQuality = availableQualities[0];
      }
      
      // Determine the MIME type based on the format
      const mimeType = format === 'mp4' ? 'video/mp4' : 'video/webm';
      
      return {
        url: selectedQuality.url,
        format,
        mimeType,
        duration,
        qualities: availableQualities,
      };
    } catch (error: any) {
      this.logger.error(`Error getting streaming info for video ${videoId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a manifest file for HLS or DASH streaming
   * This is a placeholder for future implementation
   */
  async generateManifest(
    videoId: string,
    userId: string,
    format: 'hls' | 'dash',
  ): Promise<string> {
    // This is a placeholder for future implementation
    // In a real implementation, we would generate a manifest file for HLS or DASH streaming
    // and return the URL to the manifest file
    
    this.logger.log(`Generating ${format} manifest for video ${videoId}`);
    
    // For now, we'll just return a placeholder
    return `https://example.com/manifest/${format}/${videoId}.m3u8`;
  }
}