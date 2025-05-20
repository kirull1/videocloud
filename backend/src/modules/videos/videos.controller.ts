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
  ParseUUIDPipe,
  BadRequestException,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { VideosService } from './videos.service';
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

  constructor(private readonly videosService: VideosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Use memory storage to ensure buffer is available
      limits: {
        fileSize: 1024 * 1024 * 500, // 500MB
      },
      fileFilter: (req, file, callback) => {
        // Check if file is a video
        const acceptedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

        // Skip logging if file is undefined
        if (!file) {
          return callback(new BadRequestException('No file provided'), false);
        }

        // Log file details
        console.log(`Received file: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);

        if (!acceptedMimeTypes.includes(file.mimetype)) {
          return callback(new BadRequestException('Only video files are allowed'), false);
        }

        callback(null, true);
      },
    }),
  )
  async create(
    @CurrentUser() user: User,
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFile() file: any,
  ): Promise<VideoResponseDto> {
    this.logger.log(`Uploading video for user: ${user.username} (${user.id})`);
    
    if (!file) {
      this.logger.error('No file uploaded');
      throw new BadRequestException('Video file is required');
    }
    
    this.logger.log(`File received: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);
    this.logger.log(`Buffer exists: ${!!file.buffer}, Buffer length: ${file.buffer ? file.buffer.length : 'N/A'}`);
    
    try {
      // Ensure we have a buffer
      if (!file.buffer || file.buffer.length === 0) {
        throw new BadRequestException('Empty file or missing buffer');
      }
      
      return await this.videosService.createVideo(user.id, createVideoDto, file);
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
}
