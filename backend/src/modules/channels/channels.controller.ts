import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChannelsService } from './channels.service';
import { CreateChannelDto, UpdateChannelDto, ChannelResponseDto, ChannelAnalyticsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Body() createChannelDto: CreateChannelDto,
  ): Promise<ChannelResponseDto> {
    const channel = await this.channelsService.create(req.user.id, createChannelDto);
    return plainToInstance(ChannelResponseDto, channel, { excludeExtraneousValues: true });
  }

  @Get()
  async findAll(): Promise<ChannelResponseDto[]> {
    const channels = await this.channelsService.findAll();
    return plainToInstance(ChannelResponseDto, channels, { excludeExtraneousValues: true });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMyChannel(@Request() req): Promise<ChannelResponseDto> {
    try {
      const channel = await this.channelsService.findByUserId(req.user.id);
      return plainToInstance(ChannelResponseDto, channel, { excludeExtraneousValues: true });
    } catch (error: any) {
      if (error.status === 404) {
        throw new BadRequestException('You do not have a channel yet. Please create one first.');
      }
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ChannelResponseDto> {
    const channel = await this.channelsService.findOne(id);
    return plainToInstance(ChannelResponseDto, channel, { excludeExtraneousValues: true });
  }

  @Get('custom/:customUrl')
  async findByCustomUrl(@Param('customUrl') customUrl: string): Promise<ChannelResponseDto> {
    const channel = await this.channelsService.findByCustomUrl(customUrl);
    return plainToInstance(ChannelResponseDto, channel, { excludeExtraneousValues: true });
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard)
  async getAnalytics(@Request() req, @Param('id') id: string): Promise<ChannelAnalyticsDto> {
    return this.channelsService.getAnalytics(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ): Promise<ChannelResponseDto> {
    const channel = await this.channelsService.update(id, req.user.id, updateChannelDto);
    return plainToInstance(ChannelResponseDto, channel, { excludeExtraneousValues: true });
  }

  @Post(':id/banner')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('banner', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed (jpg, jpeg, png, gif, webp)'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadBanner(
    @Request() req,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ChannelResponseDto> {
    if (!file) {
      throw new BadRequestException('Banner file is required');
    }

    const channel = await this.channelsService.uploadBanner(id, req.user.id, file);
    return plainToInstance(ChannelResponseDto, channel, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: string): Promise<void> {
    return this.channelsService.remove(id, req.user.id);
  }
}