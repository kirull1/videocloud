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
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { VideosService } from './videos.service';
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

@Controller('videos')
export class VideosController {
  private readonly logger = new Logger(VideosController.name);

  constructor(
    private readonly videosService: VideosService,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>
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
      
      return await this.videosService.createVideo(user.id, createVideoDto, videoFile, thumbnailFile);
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
}
