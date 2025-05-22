import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../../entities/channel.entity';
import { Video } from '../../entities/video.entity';
import { CreateChannelDto, UpdateChannelDto, ChannelAnalyticsDto } from './dto';
import { S3Service } from '../../shared/services/s3.service';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
    private s3Service: S3Service,
  ) {}

  async create(userId: string, createChannelDto: CreateChannelDto): Promise<Channel> {
    // Check if user already has a channel
    const existingChannel = await this.channelsRepository.findOne({
      where: { userId },
    });

    if (existingChannel) {
      throw new ConflictException('User already has a channel');
    }

    // Check if custom URL is already taken
    if (createChannelDto.customUrl) {
      const channelWithCustomUrl = await this.channelsRepository.findOne({
        where: { customUrl: createChannelDto.customUrl },
      });

      if (channelWithCustomUrl) {
        throw new ConflictException('Custom URL is already taken');
      }
    }

    // Create new channel
    const channel = this.channelsRepository.create({
      ...createChannelDto,
      userId,
    });

    return this.channelsRepository.save(channel);
  }

  async findAll(): Promise<Channel[]> {
    return this.channelsRepository.find();
  }

  async findOne(id: string): Promise<Channel> {
    const channel = await this.channelsRepository.findOne({
      where: { id },
    });

    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }

    return channel;
  }

  async findByUserId(userId: string): Promise<Channel> {
    const channel = await this.channelsRepository.findOne({
      where: { userId },
    });

    if (!channel) {
      throw new NotFoundException(`Channel for user with ID ${userId} not found`);
    }

    return channel;
  }

  async findByCustomUrl(customUrl: string): Promise<Channel> {
    const channel = await this.channelsRepository.findOne({
      where: { customUrl },
    });

    if (!channel) {
      throw new NotFoundException(`Channel with custom URL ${customUrl} not found`);
    }

    return channel;
  }

  async update(id: string, userId: string, updateChannelDto: UpdateChannelDto): Promise<Channel> {
    const channel = await this.channelsRepository.findOne({
      where: { id },
    });

    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }

    // Check if the channel belongs to the user
    if (channel.userId !== userId) {
      throw new BadRequestException('You can only update your own channel');
    }

    // Check if custom URL is already taken
    if (updateChannelDto.customUrl && updateChannelDto.customUrl !== channel.customUrl) {
      const channelWithCustomUrl = await this.channelsRepository.findOne({
        where: { customUrl: updateChannelDto.customUrl },
      });

      if (channelWithCustomUrl) {
        throw new ConflictException('Custom URL is already taken');
      }
    }

    // Update channel
    Object.assign(channel, updateChannelDto);

    return this.channelsRepository.save(channel);
  }

  async uploadBanner(id: string, userId: string, file: Express.Multer.File): Promise<Channel> {
    const channel = await this.channelsRepository.findOne({
      where: { id },
    });

    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }

    // Check if the channel belongs to the user
    if (channel.userId !== userId) {
      throw new BadRequestException('You can only update your own channel');
    }

    // For now, we'll just update the channel with a placeholder URL
    // In a real implementation, we would upload the file to S3
    const bannerUrl = `https://example.com/banners/${channel.id}`;

    // Update channel with banner URL
    channel.bannerUrl = bannerUrl;

    return this.channelsRepository.save(channel);
  }

  async getAnalytics(id: string, userId: string): Promise<ChannelAnalyticsDto> {
    const channel = await this.channelsRepository.findOne({
      where: { id },
    });

    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }

    // Check if the channel belongs to the user
    if (channel.userId !== userId) {
      throw new BadRequestException('You can only view analytics for your own channel');
    }

    // Get videos for the channel
    const videos = await this.videosRepository.find({
      where: { channelId: id },
      order: { views: 'DESC' },
      take: 5,
    });

    // Calculate average views per video
    const averageViewsPerVideo = channel.videoCount > 0 
      ? channel.totalViews / channel.videoCount 
      : 0;

    // For a real implementation, we would fetch time-series data from a database
    // Here we're just creating mock data for demonstration purposes
    const viewsPerDay: { date: string; views: number }[] = [];
    const subscribersPerDay: { date: string; subscribers: number }[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      viewsPerDay.push({
        date: dateStr,
        views: Math.floor(Math.random() * 900) + 100, // Random between 100-1000
      });
      
      subscribersPerDay.push({
        date: dateStr,
        subscribers: Math.floor(Math.random() * 15) + 5, // Random between 5-20
      });
    }

    return {
      totalViews: channel.totalViews,
      subscriberCount: channel.subscriberCount,
      videoCount: channel.videoCount,
      averageViewsPerVideo,
      mostViewedVideos: videos.map(video => ({
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl || '',
        views: video.views,
      })),
      viewsPerDay,
      subscribersPerDay,
    };
  }

  async remove(id: string, userId: string): Promise<void> {
    const channel = await this.channelsRepository.findOne({
      where: { id },
    });

    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }

    // Check if the channel belongs to the user
    if (channel.userId !== userId) {
      throw new BadRequestException('You can only delete your own channel');
    }

    await this.channelsRepository.remove(channel);
  }
}