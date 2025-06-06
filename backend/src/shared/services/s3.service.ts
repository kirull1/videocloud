import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

// Define the file interface since Express.Multer is not available
interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

// Define a custom error type for better error handling
interface S3Error extends Error {
  stack?: string;
  message: string;
}

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicUrlExpiration: number;
  private readonly videoFolder: string;
  private readonly thumbnailFolder: string;
  private readonly avatarFolder: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('s3.region') || 'ru-central1';
    const endpoint =
      this.configService.get<string>('s3.endpoint') || 'https://storage.yandexcloud.net';
    const accessKeyId = this.configService.get<string>('s3.accessKeyId') || '';
    const secretAccessKey = this.configService.get<string>('s3.secretAccessKey') || '';

    this.bucket = this.configService.get<string>('s3.bucket') || 'videocloud-bucket';
    this.publicUrlExpiration = this.configService.get<number>('s3.publicUrlExpiration') || 3600;
    this.videoFolder = this.configService.get<string>('s3.videoFolder') || 'videos/';
    this.thumbnailFolder = this.configService.get<string>('s3.thumbnailFolder') || 'thumbnails/';
    this.avatarFolder = this.configService.get<string>('s3.avatarFolder') || 'avatars/';

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Needed for Yandex Cloud S3
    });

    this.logger.log(`S3 client initialized with bucket: ${this.bucket}`);
  }

  /**
   * Generate a unique filename based on original name and current timestamp
   */
  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const hash = createHash('md5')
      .update(`${originalName}${timestamp}`)
      .digest('hex')
      .substring(0, 8);
    const ext = extname(originalName);
    return `${hash}-${timestamp}${ext}`;
  }

  /**
   * Upload a video file to S3
   */
  async uploadVideo(file: UploadedFile, userId: string): Promise<string> {
    const uniqueFilename = this.generateUniqueFilename(file.originalname);
    const key = `${this.videoFolder}${userId}/${uniqueFilename}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      this.logger.log(`Video uploaded successfully: ${key}`);
      return key;
    } catch (error) {
      const s3Error = error as S3Error;
      this.logger.error(`Failed to upload video: ${s3Error.message}`, s3Error.stack);
      throw new Error(`Failed to upload video: ${s3Error.message}`);
    }
  }

  /**
   * Upload a thumbnail image to S3
   */
  async uploadThumbnail(
    buffer: Buffer,
    mimeType: string,
    userId: string,
    videoId: string,
  ): Promise<string> {
    // Use the original file extension if possible, otherwise default to jpg
    const extension = mimeType.split('/')[1] || 'jpg';
    // Add a timestamp to the filename to prevent caching issues
    const timestamp = Date.now();
    const uniqueFilename = `${videoId}_${timestamp}.${extension}`;
    const key = `${this.thumbnailFolder}${userId}/${videoId}/${uniqueFilename}`;

    try {
      // Create directory structure if it doesn't exist
      const dirPath = path.dirname(key);
      
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          // Make thumbnails publicly accessible like avatars
          ACL: 'public-read',
          // Add cache control headers to prevent caching
          CacheControl: 'no-cache, no-store, must-revalidate',
          Expires: new Date(0),
        }),
      );

      this.logger.log(`Thumbnail uploaded successfully: ${key}`);
      return key;
    } catch (error) {
      const s3Error = error as S3Error;
      this.logger.error(`Failed to upload thumbnail: ${s3Error.message}`, s3Error.stack);
      throw new Error(`Failed to upload thumbnail: ${s3Error.message}`);
    }
  }

  /**
   * Upload an avatar image to S3
   */
  async uploadAvatar(file: UploadedFile, userId: string): Promise<string> {
    const uniqueFilename = this.generateUniqueFilename(file.originalname);
    const key = `${this.avatarFolder}${userId}/${uniqueFilename}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          // Make avatars publicly accessible
          ACL: 'public-read',
        }),
      );

      this.logger.log(`Avatar uploaded successfully: ${key}`);
      return key;
    } catch (error) {
      const s3Error = error as S3Error;
      this.logger.error(`Failed to upload avatar: ${s3Error.message}`, s3Error.stack);
      throw new Error(`Failed to upload avatar: ${s3Error.message}`);
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      const s3Error = error as S3Error;
      this.logger.error(`Failed to delete file: ${s3Error.message}`, s3Error.stack);
      throw new Error(`Failed to delete file: ${s3Error.message}`);
    }
  }

  /**
   * Generate a signed URL for accessing a file
   */
  async getSignedUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: this.publicUrlExpiration,
      });

      return url;
    } catch (error) {
      const s3Error = error as S3Error;
      this.logger.error(`Failed to generate signed URL: ${s3Error.message}`, s3Error.stack);
      throw new Error(`Failed to generate signed URL: ${s3Error.message}`);
    }
  }

  /**
   * Get the public URL for a file
   */
  getPublicUrl(key: string, noCaching: boolean = false): string {
    const baseUrl = `https://${this.bucket}.storage.yandexcloud.net/${key}`;
    
    // Add a cache-busting parameter if noCaching is true
    if (noCaching) {
      const timestamp = Date.now();
      return `${baseUrl}?t=${timestamp}`;
    }
    
    return baseUrl;
  }

  /**
   * Get a file stream from S3
   */
  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('Empty response body');
      }
      
      return response.Body as NodeJS.ReadableStream;
    } catch (error: any) {
      this.logger.error(`Failed to get file stream: ${error.message}`, error.stack);
      throw new Error(`Failed to get file stream: ${error.message}`);
    }
  }

  /**
   * Upload a file from a local path to S3
   */
  async uploadFile(localPath: string, s3Key: string, contentType?: string, publicRead?: boolean): Promise<string> {
    try {
      const fileContent = fs.readFileSync(localPath);
      
      const params: any = {
        Bucket: this.bucket,
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType || this.getContentType(localPath),
      };
      
      // Add ACL if publicRead is true
      if (publicRead) {
        params.ACL = 'public-read';
      }
      
      await this.s3Client.send(new PutObjectCommand(params));

      this.logger.log(`File uploaded successfully: ${s3Key}`);
      return s3Key;
    } catch (error: any) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Get content type based on file extension
   */
  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.mp4':
        return 'video/mp4';
      case '.webm':
        return 'video/webm';
      case '.ogg':
        return 'video/ogg';
      case '.mov':
        return 'video/quicktime';
      default:
        return 'application/octet-stream';
    }
  }
}
