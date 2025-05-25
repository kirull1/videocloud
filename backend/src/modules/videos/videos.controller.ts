import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseUUIDPipe,
  BadRequestException,
  HttpStatus,
  HttpCode,
  Logger,
  NotFoundException,
  ForbiddenException,
  Res,
  Sse,
  Header,
} from '@nestjs/common';
import { Observable, interval, map, filter, takeWhile } from 'rxjs';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { VideosService } from './videos.service';
import { ProcessingProgressService, ProcessingStage } from '../../shared/services/video-processing/processing-progress.service';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../entities/video.entity';
import {
  CreateVideoDto,
  UpdateVideoDto,
  VideoQueryDto,
  VideoResponseDto,
  PaginatedVideosResponseDto,
} from './dto';
import { memoryStorage } from 'multer';

// Define the MessageEvent interface for SSE
interface MessageEvent {
  data: any;
  id?: string;
  type?: string;
  retry?: number;
}

@Controller('videos')
export class VideosController {
  private readonly logger = new Logger(VideosController.name);

  constructor(
    private readonly videosService: VideosService,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly processingProgressService: ProcessingProgressService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      {
        storage: memoryStorage(), // Use memory storage to ensure buffer is available
        limits: {
          fileSize: 1024 * 1024 * 500, // 500MB
        },
        fileFilter: (req, file, callback) => {
          // Skip logging if file is undefined
          if (!file) {
            return callback(new BadRequestException('No file provided'), false);
          }

          // Log file details
          console.log(`Received file: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);

          // Check if file is a video
          if (file.fieldname === 'file') {
            const acceptedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
            if (!acceptedMimeTypes.includes(file.mimetype)) {
              return callback(new BadRequestException('Only video files are allowed'), false);
            }
          }

          // Check if file is a thumbnail
          if (file.fieldname === 'thumbnail') {
            const acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!acceptedMimeTypes.includes(file.mimetype)) {
              return callback(new BadRequestException('Only JPEG or PNG thumbnails are allowed'), false);
            }
          }

          callback(null, true);
        },
      },
    ),
  )
  async create(
    @CurrentUser() user: User,
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFiles() files: { file?: Express.Multer.File[], thumbnail?: Express.Multer.File[] },
    @Res({ passthrough: true }) response: Response,
  ): Promise<VideoResponseDto> {
    this.logger.log(`Uploading video for user: ${user.username} (${user.id})`);
    
    if (!files.file || files.file.length === 0) {
      this.logger.error('No file uploaded');
      throw new BadRequestException('Video file is required');
    }
    
    const videoFile = files.file[0];
    const thumbnailFile = files.thumbnail && files.thumbnail.length > 0 ? files.thumbnail[0] : null;
    
    this.logger.log(`File received: ${videoFile.originalname}, size: ${videoFile.size}, type: ${videoFile.mimetype}`);
    this.logger.log(`Buffer exists: ${!!videoFile.buffer}, Buffer length: ${videoFile.buffer ? videoFile.buffer.length : 'N/A'}`);
    
    if (thumbnailFile) {
      this.logger.log(`Thumbnail received: ${thumbnailFile.originalname}, size: ${thumbnailFile.size}, type: ${thumbnailFile.mimetype}`);
    }
    
    try {
      // Ensure we have a buffer
      if (!videoFile.buffer || videoFile.buffer.length === 0) {
        throw new BadRequestException('Empty file or missing buffer');
      }
      
      // Create the video
      const video = await this.videosService.createVideo(user.id, createVideoDto, videoFile, thumbnailFile);
      
      // Initialize progress tracking
      this.processingProgressService.initProgress(video.id);
      
      // Update progress to analyzing stage
      this.processingProgressService.updateProgress(
        video.id,
        ProcessingStage.ANALYZING,
        50,
        'Video uploaded successfully, now processing'
      );
      
      // Add a custom header to indicate that this is a newly uploaded video
      // The frontend can use this header to determine whether to do a full page reload
      response.header('X-Video-Just-Uploaded', 'true');
      response.header('X-Video-Id', video.id);
      
      return video;
    } catch (error: any) {
      this.logger.error(`Error uploading video: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  async findAll(
    @Query() query: VideoQueryDto,
    @CurrentUser() user?: User,
  ): Promise<PaginatedVideosResponseDto> {
    try {
      return await this.videosService.findAll(query, user?.id);
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      // Return empty results on error
      return {
        items: [],
        total: 0,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages: 0,
      };
    }
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: User,
  ): Promise<VideoResponseDto> {
    return await this.videosService.findOne(id, user?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVideoDto: UpdateVideoDto,
    @CurrentUser() user: User,
  ): Promise<VideoResponseDto> {
    return await this.videosService.update(id, updateVideoDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User): Promise<void> {
    await this.videosService.remove(id, user.id);
  }

  @Get(':id/stream')
  async streamVideo(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() response: Response,
    @CurrentUser() user?: User,
  ): Promise<void> {
    this.logger.log(`Streaming video: ${id}`);
    
    try {
      // Get the video
      const video = await this.videoRepository.findOne({
        where: { id },
      });
      
      if (!video) {
        throw new NotFoundException('Video not found');
      }
      
      // Check if user has permission to view this video
      if (!video.isPublic && video.userId !== user?.id) {
        throw new ForbiddenException('You do not have permission to view this video');
      }
      
      // Get the signed URL for the video
      const signedUrl = await this.videosService.getVideoStreamUrl(id, user?.id);
      
      // Redirect to the signed URL
      response.redirect(signedUrl);
    } catch (error: any) {
      this.logger.error(`Error streaming video: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get processing progress for a video using Server-Sent Events (SSE)
   * This allows the frontend to receive real-time updates on video processing
   */
  @Sse(':id/progress')
  // Remove JwtAuthGuard to allow public access for SSE
  // Enable CORS specifically for SSE
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Methods', 'GET')
  @Header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  getProcessingProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: User, // Make user optional since we removed the JwtAuthGuard
  ): Observable<MessageEvent> {
    this.logger.log(`Getting processing progress for video: ${id}`);
    
    // Check if video exists and user has permission
    return new Observable<MessageEvent>(observer => {
      // First check if the video exists and user has permission
      this.videoRepository.findOne({
        where: { id },
      }).then(video => {
        if (!video) {
          observer.error(new NotFoundException('Video not found'));
          return;
        }
        
        // Allow access to the video owner or if the video is public
        // If user is not authenticated, only allow access to public videos
        if ((!user && !video.isPublic) || (user && video.userId !== user.id && !video.isPublic)) {
          observer.error(new ForbiddenException('You do not have permission to view this video'));
          return;
        }
        
        // Get initial progress
        const initialProgress = this.processingProgressService.getProgress(id);
        
        if (initialProgress) {
          observer.next({ 
            data: initialProgress 
          });
          
          // If already completed or failed, just send once and complete
          if (initialProgress.stage === ProcessingStage.COMPLETED || 
              initialProgress.stage === ProcessingStage.FAILED) {
            observer.complete();
            return;
          }
        } else {
          // If no progress found, send a default "not started" message
          observer.next({ 
            data: {
              videoId: id,
              stage: ProcessingStage.UPLOADING,
              progress: 0,
              message: 'Processing not started or already completed',
              startedAt: new Date(),
              updatedAt: new Date(),
            }
          });
          observer.complete();
          return;
        }
        
        // Set up interval to check for progress updates
        const intervalId = setInterval(() => {
          const progress = this.processingProgressService.getProgress(id);
          
          if (progress) {
            observer.next({ data: progress });
            
            // If completed or failed, stop sending updates
            if (progress.stage === ProcessingStage.COMPLETED || 
                progress.stage === ProcessingStage.FAILED) {
              clearInterval(intervalId);
              observer.complete();
            }
          } else {
            // If progress was removed, stop sending updates
            clearInterval(intervalId);
            observer.complete();
          }
        }, 1000); // Check every second
        
        // Clean up interval when client disconnects
        return () => {
          clearInterval(intervalId);
        };
      }).catch(error => {
        this.logger.error(`Error getting video: ${error.message}`);
        observer.error(error);
      });
    });
  }

  /**
   * Get current processing progress for a video (non-SSE version)
   */
  @Get(':id/progress-status')
  // Remove JwtAuthGuard to allow public access
  // Enable CORS specifically for progress status endpoint
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Methods', 'GET')
  @Header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  async getProcessingStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: User, // Make user optional since we removed the JwtAuthGuard
  ) {
    this.logger.log(`Getting processing status for video: ${id}`);
    
    // Check if video exists and user has permission
    const video = await this.videoRepository.findOne({
      where: { id },
    });
    
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    
    // Allow access to the video owner or if the video is public
    // If user is not authenticated, only allow access to public videos
    if ((!user && !video.isPublic) || (user && video.userId !== user.id && !video.isPublic)) {
      throw new ForbiddenException('You do not have permission to view this video');
    }
    
    // Get progress
    const progress = this.processingProgressService.getProgress(id);
    
    if (!progress) {
      return {
        videoId: id,
        stage: ProcessingStage.COMPLETED, // Assume completed if no progress found
        progress: 100,
        message: 'Processing completed or not started',
        startedAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date(),
      };
    }
    
    return progress;
  }

  @Get(':id/streaming-info')
  async getStreamingInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('format') format?: 'mp4' | 'hls' | 'dash',
    @Query('quality') quality?: 'auto' | 'high' | 'medium' | 'low',
    @CurrentUser() user?: User,
  ) {
    this.logger.log(`Getting streaming info for video: ${id}, format: ${format}, quality: ${quality}`);
    
    try {
      const options = {
        format: format || 'mp4',
        quality: quality || 'auto',
      };
      
      return await this.videosService.getStreamingInfo(id, user?.id, options);
    } catch (error: any) {
      this.logger.error(`Error getting streaming info: ${error.message}`, error.stack);
      throw error;
    }
  }
}
