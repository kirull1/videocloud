import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { extname, join } from 'path';
import * as fs from 'fs';
import * as path from 'path';

// Define the file interface since Express.Multer is not available
interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@Injectable()
export class LocalFileService {
  private readonly baseDir: string;
  private readonly videoFolder: string;
  private readonly thumbnailFolder: string;
  private readonly avatarFolder: string;
  private readonly logger = new Logger(LocalFileService.name);

  constructor(private readonly configService: ConfigService) {
    this.baseDir = join(process.cwd(), 'temp', 'uploads');
    this.videoFolder = join(this.baseDir, 'videos');
    this.thumbnailFolder = join(this.baseDir, 'thumbnails');
    this.avatarFolder = join(this.baseDir, 'avatars');

    // Create directories if they don't exist
    this.ensureDirectoryExists(this.baseDir);
    this.ensureDirectoryExists(this.videoFolder);
    this.ensureDirectoryExists(this.thumbnailFolder);
    this.ensureDirectoryExists(this.avatarFolder);

    this.logger.log(`LocalFileService initialized with base directory: ${this.baseDir}`);
  }

  /**
   * Ensure a directory exists, create it if it doesn't
   */
  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      this.logger.log(`Created directory: ${dir}`);
    }
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
   * Upload a video file to local file system
   */
  async uploadVideo(file: UploadedFile, userId: string): Promise<string> {
    const userDir = join(this.videoFolder, userId);
    this.ensureDirectoryExists(userDir);

    const uniqueFilename = this.generateUniqueFilename(file.originalname);
    const filePath = join(userDir, uniqueFilename);
    const key = `videos/${userId}/${uniqueFilename}`;

    try {
      fs.writeFileSync(filePath, file.buffer);
      this.logger.log(`Video uploaded successfully: ${filePath}`);
      return key;
    } catch (error: any) {
      this.logger.error(`Failed to upload video: ${error.message}`, error.stack);
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }

  /**
   * Upload a thumbnail image to local file system
   */
  async uploadThumbnail(
    buffer: Buffer,
    mimeType: string,
    userId: string,
    videoId: string,
  ): Promise<string> {
    const userDir = join(this.thumbnailFolder, userId);
    this.ensureDirectoryExists(userDir);

    const uniqueFilename = `${videoId}.jpg`;
    const filePath = join(userDir, uniqueFilename);
    const key = `thumbnails/${userId}/${uniqueFilename}`;

    try {
      fs.writeFileSync(filePath, buffer);
      this.logger.log(`Thumbnail uploaded successfully: ${filePath}`);
      return key;
    } catch (error: any) {
      this.logger.error(`Failed to upload thumbnail: ${error.message}`, error.stack);
      throw new Error(`Failed to upload thumbnail: ${error.message}`);
    }
  }

  /**
   * Upload an avatar image to local file system
   */
  async uploadAvatar(file: UploadedFile, userId: string): Promise<string> {
    const userDir = join(this.avatarFolder, userId);
    this.ensureDirectoryExists(userDir);

    const uniqueFilename = this.generateUniqueFilename(file.originalname);
    const filePath = join(userDir, uniqueFilename);
    const key = `avatars/${userId}/${uniqueFilename}`;

    try {
      fs.writeFileSync(filePath, file.buffer);
      this.logger.log(`Avatar uploaded successfully: ${filePath}`);
      return key;
    } catch (error: any) {
      this.logger.error(`Failed to upload avatar: ${error.message}`, error.stack);
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }
  }

  /**
   * Delete a file from local file system
   */
  async deleteFile(key: string): Promise<void> {
    const filePath = this.getLocalPath(key);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`File deleted successfully: ${filePath}`);
      } else {
        this.logger.warn(`File not found for deletion: ${filePath}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Generate a URL for accessing a file
   */
  async getSignedUrl(key: string): Promise<string> {
    const filePath = this.getLocalPath(key);

    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // For local development, we'll just return a file:// URL
      return `file://${filePath}`;
    } catch (error: any) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`, error.stack);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Get the public URL for a file
   */
  getPublicUrl(key: string): string {
    const filePath = this.getLocalPath(key);
    return `file://${filePath}`;
  }

  /**
   * Get a file stream from local file system
   */
  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    const filePath = this.getLocalPath(key);

    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      return fs.createReadStream(filePath);
    } catch (error: any) {
      this.logger.error(`Failed to get file stream: ${error.message}`, error.stack);
      throw new Error(`Failed to get file stream: ${error.message}`);
    }
  }

  /**
   * Upload a file from a local path
   */
  async uploadFile(localPath: string, key: string, contentType?: string): Promise<string> {
    const destPath = this.getLocalPath(key);
    const destDir = path.dirname(destPath);

    try {
      this.ensureDirectoryExists(destDir);
      fs.copyFileSync(localPath, destPath);
      this.logger.log(`File uploaded successfully: ${destPath}`);
      return key;
    } catch (error: any) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Get the local file path for a key
   */
  private getLocalPath(key: string): string {
    // Split the key into parts
    const parts = key.split('/');
    
    // The first part is the folder (videos, thumbnails, avatars)
    const folder = parts[0];
    
    // The rest of the parts form the path within the folder
    const restPath = parts.slice(1).join('/');
    
    // Determine the base folder
    let baseFolder: string;
    switch (folder) {
      case 'videos':
        baseFolder = this.videoFolder;
        break;
      case 'thumbnails':
        baseFolder = this.thumbnailFolder;
        break;
      case 'avatars':
        baseFolder = this.avatarFolder;
        break;
      default:
        baseFolder = this.baseDir;
    }
    
    // Join the base folder with the rest of the path
    return join(baseFolder, restPath);
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