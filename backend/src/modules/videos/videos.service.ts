import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as path from 'path';
import { Video, VideoStatus, VideoVisibility } from '../../entities/video.entity';
import { User } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';
import { Tag } from '../../entities/tag.entity';
import { S3Service } from '../../shared/services/s3.service';
import { VideoDurationUtil } from '../../utils/video-duration.util';
import { VideoProcessingService } from '../../shared/services/video-processing/video-processing.service';
import { VideoPlayerService, StreamingOptions, StreamingResponse } from '../../shared/services/video-player/video-player.service';
import {
  CreateVideoDto,
  UpdateVideoDto,
  VideoQueryDto,
  VideoResponseDto,
  PaginatedVideosResponseDto,
} from './dto';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly s3Service: S3Service,
    private readonly videoProcessingService: VideoProcessingService,
    private readonly videoPlayerService: VideoPlayerService,
  ) {}

  async createVideo(
    userId: string,
    createVideoDto: CreateVideoDto,
    file: {
      originalname: string;
      buffer: Buffer;
      size: number;
      mimetype: string;
    },
    thumbnailFile?: {
      originalname: string;
      buffer: Buffer;
      size: number;
      mimetype: string;
    } | null,
  ): Promise<VideoResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find category if provided
    let category: Category | undefined = undefined;
    if (createVideoDto.categoryId) {
      const foundCategory = await this.categoryRepository.findOne({
        where: { id: createVideoDto.categoryId },
      });

      if (!foundCategory) {
        throw new NotFoundException(`Category with ID ${createVideoDto.categoryId} not found`);
      }

      category = foundCategory;
    }

    // Find tags if provided
    const tags: Tag[] = [];
    if (createVideoDto.tagIds && createVideoDto.tagIds.length > 0) {
      const foundTags = await this.tagRepository.find({
        where: { id: In(createVideoDto.tagIds) },
      });

      if (foundTags.length !== createVideoDto.tagIds.length) {
        throw new NotFoundException('One or more tags not found');
      }

      tags.push(...foundTags);
    }

    // Upload video to S3
    const s3Key = await this.s3Service.uploadVideo(file, userId);

    // Handle thumbnail
    let thumbnailUrl: string;
    
    if (thumbnailFile && thumbnailFile.buffer) {
      // If a thumbnail was provided, upload it to S3
      const thumbnailKey = await this.s3Service.uploadThumbnail(
        thumbnailFile.buffer,
        thumbnailFile.mimetype,
        userId,
        Date.now().toString() // Use timestamp as videoId since we don't have the video ID yet
      );
      
      // Generate the public URL for the thumbnail
      thumbnailUrl = this.s3Service.getPublicUrl(thumbnailKey);
    } else {
      // If no thumbnail was provided, use a placeholder
      thumbnailUrl = `https://picsum.photos/seed/${Date.now()}/640/360`;
    }

    // Calculate video duration if not provided
    let duration = createVideoDto.duration;
    if (!duration && file.buffer) {
      try {
        this.logger.log('Calculating video duration...');
        duration = await VideoDurationUtil.calculateDuration(file.buffer, file.mimetype);
        this.logger.log(`Video duration calculated: ${duration} seconds`);
      } catch (error: any) {
        this.logger.error(`Failed to calculate video duration: ${error.message}`, error.stack);
        // Continue without duration if calculation fails
      }
    }

    // Create video entity
    const video = new Video();
    video.title = createVideoDto.title;
    video.description = createVideoDto.description;
    video.filePath = s3Key;
    video.thumbnailUrl = thumbnailUrl;
    video.userId = userId;
    video.duration = duration;
    // Set isPublic based on visibility
    video.isPublic = createVideoDto.visibility === VideoVisibility.PUBLIC;
    video.category = category;
    video.tags = tags;

    // Save video to database
    const savedVideo = await this.videoRepository.save(video);

    // Start video processing in the background
    this.processVideoInBackground(savedVideo.id, s3Key, userId);

    return this.mapVideoToResponseDto(savedVideo, user);
  }

  async findAll(
    queryDto: VideoQueryDto,
    currentUserId?: string,
  ): Promise<PaginatedVideosResponseDto> {
    const {
      page = 1,
      limit = 20,
    } = queryDto;

    try {
      // Get all videos with relations
      const allVideos = await this.videoRepository.find({
        relations: ['user', 'category', 'tags'],
      });
      
      // Filter videos based on search query if provided
      let filteredVideos = allVideos;
      
      if (queryDto.search) {
        const searchTerm = queryDto.search.toLowerCase();
        filteredVideos = allVideos.filter(video =>
          video.title.toLowerCase().includes(searchTerm) ||
          (video.description && video.description.toLowerCase().includes(searchTerm))
        );
      }
      
      // Map videos to response DTOs
      const items = filteredVideos.map(video => this.mapVideoToResponseDto(video, video.user));
      
      return {
        items,
        total: items.length,
        page,
        limit,
        totalPages: Math.ceil(items.length / limit),
      };
    } catch (error) {
      console.error('Error fetching videos:', error);
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

  }

  async findOne(id: string, currentUserId?: string): Promise<VideoResponseDto> {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['user', 'category', 'tags'],
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Check if user has permission to view this video
    if (!video.isPublic && video.userId !== currentUserId) {
      throw new ForbiddenException('You do not have permission to view this video');
    }

    // Increment view count if not viewed by the owner
    if (video.userId !== currentUserId) {
      await this.videoRepository.increment({ id }, 'views', 1);
      video.views += 1;
    }

    // Generate signed URL for video if it exists
    let videoUrl: string | null = null;
    if (video.filePath) {
      try {
        videoUrl = await this.s3Service.getSignedUrl(video.filePath);
      } catch (error) {
        console.error(`Failed to generate signed URL for video ${video.id}:`, error);
      }
    }

    const responseDto = this.mapVideoToResponseDto(video, video.user);
    responseDto.videoUrl = videoUrl;

    return responseDto;
  }

  async update(
    id: string,
    updateVideoDto: UpdateVideoDto,
    currentUserId: string,
  ): Promise<VideoResponseDto> {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['user', 'category', 'tags'],
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Check if user has permission to update this video
    if (video.userId !== currentUserId) {
      throw new ForbiddenException('You do not have permission to update this video');
    }

    // Handle category update
    if (updateVideoDto.categoryId !== undefined) {
      if (updateVideoDto.categoryId) {
        const category = await this.categoryRepository.findOne({
          where: { id: updateVideoDto.categoryId },
        });

        if (!category) {
          throw new NotFoundException(`Category with ID ${updateVideoDto.categoryId} not found`);
        }

        video.category = category;
      } else {
        video.category = undefined;
      }

      delete updateVideoDto.categoryId;
    }

    // Handle tags update
    if (updateVideoDto.tagIds !== undefined) {
      if (updateVideoDto.tagIds && updateVideoDto.tagIds.length > 0) {
        const tags = await this.tagRepository.find({
          where: { id: In(updateVideoDto.tagIds) },
        });

        if (tags.length !== updateVideoDto.tagIds.length) {
          throw new NotFoundException('One or more tags not found');
        }

        video.tags = tags;
      } else {
        video.tags = [];
      }

      delete updateVideoDto.tagIds;
    }

    // Update isPublic based on visibility
    if (updateVideoDto.visibility) {
      video.isPublic = updateVideoDto.visibility === VideoVisibility.PUBLIC;
      delete updateVideoDto.visibility;
    }

    // Update video
    Object.assign(video, updateVideoDto);
    const updatedVideo = await this.videoRepository.save(video);

    // Generate signed URL for video if it exists
    let videoUrl: string | null = null;
    if (updatedVideo.filePath) {
      try {
        videoUrl = await this.s3Service.getSignedUrl(updatedVideo.filePath);
      } catch (error) {
        console.error(`Failed to generate signed URL for video ${updatedVideo.id}:`, error);
      }
    }

    const responseDto = this.mapVideoToResponseDto(updatedVideo, video.user);
    responseDto.videoUrl = videoUrl;

    return responseDto;
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    const video = await this.videoRepository.findOne({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Check if user has permission to delete this video
    if (video.userId !== currentUserId) {
      throw new ForbiddenException('You do not have permission to delete this video');
    }

    // Delete video file from S3
    try {
      if (video.filePath) {
        await this.s3Service.deleteFile(video.filePath);
      }

      // Delete thumbnail if it's stored in S3
      if (video.thumbnailUrl && video.thumbnailUrl.includes('storage.yandexcloud.net')) {
        const thumbnailKey = video.thumbnailUrl.split('storage.yandexcloud.net/')[1];
        await this.s3Service.deleteFile(thumbnailKey);
      }
    } catch (error) {
      console.error('Error deleting video files from S3:', error);
    }

    // Delete video from database
    await this.videoRepository.remove(video);
  }

  private mapVideoToResponseDto(video: Video, user: User): VideoResponseDto {
    // Determine status based on isPublic
    const status = video.isPublic ? VideoStatus.READY : VideoStatus.PROCESSING;
    // Determine visibility based on isPublic
    const visibility = video.isPublic ? VideoVisibility.PUBLIC : VideoVisibility.PRIVATE;

    return {
      id: video.id,
      title: video.title,
      description: video.description,
      status,
      visibility,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: null, // Will be set separately if needed
      duration: video.duration,
      views: video.views,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      userId: video.userId,
      username: user.username,
      userAvatarUrl: user.avatarUrl,
      categoryId: video.category?.id,
      category: video.category
        ? {
            id: video.category.id,
            name: video.category.name,
            slug: video.category.slug,
            description: video.category.description,
            iconUrl: video.category.iconUrl,
            order: video.category.order,
            createdAt: video.category.createdAt,
            updatedAt: video.category.updatedAt,
          }
        : undefined,
      tags: video.tags
        ? video.tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            usageCount: tag.usageCount,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt,
          }))
        : [],
    };
  }

  /**
   * Get a signed URL for streaming a video
   */
  async getVideoStreamUrl(id: string, currentUserId?: string): Promise<string> {
    const video = await this.videoRepository.findOne({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Check if user has permission to view this video
    if (!video.isPublic && video.userId !== currentUserId) {
      throw new ForbiddenException('You do not have permission to view this video');
    }

    // Generate signed URL for video
    if (!video.filePath) {
      throw new NotFoundException('Video file not found');
    }

    try {
      const signedUrl = await this.s3Service.getSignedUrl(video.filePath);
      return signedUrl;
    } catch (error: any) {
      console.error(`Failed to generate signed URL for video ${video.id}:`, error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Process a video in the background after it has been uploaded
   * This method will:
   * 1. Create different quality variants of the video
   * 2. Generate thumbnails at different timestamps
   * 3. Update the video entity with the processed information
   */
  private async processVideoInBackground(videoId: string, s3Key: string, userId: string): Promise<void> {
    try {
      this.logger.log(`Starting background processing for video ${videoId}`);
      
      // Get the video entity
      const video = await this.videoRepository.findOne({
        where: { id: videoId },
      });
      
      if (!video) {
        this.logger.error(`Video ${videoId} not found for processing`);
        return;
      }
      
      // Process the video
      const result = await this.videoProcessingService.processVideo(s3Key, userId, videoId);
      
      // Update the video entity with the processed information
      video.duration = result.duration || video.duration;
      
      // If thumbnails were generated, update the thumbnail URL to use the first one
      if (result.thumbnails.length > 0) {
        video.thumbnailUrl = this.s3Service.getPublicUrl(result.thumbnails[0].path);
      }
      
      // Set the video status to READY
      video.isPublic = true;
      
      // Save the updated video entity
      await this.videoRepository.save(video);
      
      this.logger.log(`Background processing completed for video ${videoId}`);
    } catch (error: any) {
      this.logger.error(`Error processing video ${videoId}: ${error.message}`, error.stack);
      // Don't throw the error, just log it, as this is a background process
    }
  }

  /**
   * Get streaming information for a video
   * @param id Video ID
   * @param currentUserId Current user ID
   * @param options Streaming options
   * @returns Streaming information
   */
  async getStreamingInfo(
    id: string,
    currentUserId?: string,
    options: StreamingOptions = {},
  ): Promise<StreamingResponse> {
    this.logger.log(`Getting streaming info for video ${id} with options: ${JSON.stringify(options)}`);
    
    const video = await this.videoRepository.findOne({
      where: { id },
    });
    
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    
    // Check if user has permission to view this video
    if (!video.isPublic && video.userId !== currentUserId) {
      throw new ForbiddenException('You do not have permission to view this video');
    }
    
    // Check if video file exists
    if (!video.filePath) {
      throw new NotFoundException('Video file not found');
    }
    
    // Get streaming information from the video player service
    return this.videoPlayerService.getStreamingInfo(
      id,
      video.userId,
      video.filePath,
      video.duration || 0,
      options,
    );
  }
}
