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

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 100, // 100MB
      },
      fileFilter: (req, file, callback) => {
        // Check if file is a video
        const acceptedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

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
    if (!file) {
      throw new BadRequestException('Video file is required');
    }

    return await this.videosService.createVideo(user.id, createVideoDto, file);
  }

  @Get()
  async findAll(
    @Query() query: VideoQueryDto,
    @CurrentUser() user?: User,
  ): Promise<PaginatedVideosResponseDto> {
    try {
      return await this.videosService.findAll(query, user?.id);
    } catch (error) {
      console.error('Error in findAll:', error);
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
