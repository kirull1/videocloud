import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Video, VideoStatus, VideoVisibility } from '../../entities/video.entity';
import { User } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';
import { Tag } from '../../entities/tag.entity';
import {
  CreateVideoDto,
  UpdateVideoDto,
  VideoQueryDto,
  VideoResponseDto,
  PaginatedVideosResponseDto,
} from './dto';

const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

@Injectable()
export class VideosService {
  private readonly uploadDir = 'uploads/videos';
  private readonly thumbnailDir = 'uploads/thumbnails';

  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {
    // Ensure upload directories exist
    this.ensureDirectoriesExist();
  }

  private async ensureDirectoriesExist(): Promise<void> {
    try {
      await mkdirAsync(this.uploadDir, { recursive: true });
      await mkdirAsync(this.thumbnailDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directories:', error);
    }
  }

  async createVideo(
    userId: string,
    createVideoDto: CreateVideoDto,
    file: {
      originalname: string;
      buffer: Buffer;
      size: number;
    },
  ): Promise<VideoResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a unique filename
    const fileExtension = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
    const filePath = path.join(this.uploadDir, filename);

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

    // Create video entity
    const video = this.videoRepository.create({
      ...createVideoDto,
      filename,
      fileSize: file.size,
      userId,
      status: VideoStatus.PROCESSING, // Will be processed asynchronously
      visibility: createVideoDto.visibility || VideoVisibility.PRIVATE,
      category,
      tags,
    });

    // Save video to database
    const savedVideo = await this.videoRepository.save(video);

    // Move uploaded file to final location
    // In a real application, this would be handled by a file storage service
    fs.writeFileSync(filePath, file.buffer);

    // In a real application, we would trigger video processing here
    // For now, we'll just simulate it by setting the status to READY after a delay
    setTimeout(() => {
      void this.videoRepository.update(savedVideo.id, {
        status: VideoStatus.READY,
        // In a real application, we would also set duration, generate thumbnails, etc.
      });
    }, 5000);

    return this.mapVideoToResponseDto(savedVideo, user);
  }

  async findAll(
    queryDto: VideoQueryDto,
    currentUserId?: string,
  ): Promise<PaginatedVideosResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      visibility,
      categoryId,
      tagId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    // Use raw query to avoid column name issues
    const skip = (page - 1) * limit;

    // Build the WHERE clause
    let whereClause = '';
    const params: any = {};

    if (!currentUserId) {
      whereClause = `WHERE v.visibility = 'public' AND v.status = 'ready'`;
    } else {
      whereClause = `WHERE (v.user_id = '${currentUserId}' OR (v.visibility = 'public' AND v.status = 'ready'))`;
    }

    if (search) {
      whereClause += ` AND (v.title ILIKE '%${search}%' OR v.description ILIKE '%${search}%')`;
    }

    if (status && currentUserId) {
      whereClause += ` AND (v.user_id = '${currentUserId}' AND v.status = '${status}')`;
    }

    if (visibility && currentUserId) {
      whereClause += ` AND (v.user_id = '${currentUserId}' AND v.visibility = '${visibility}')`;
    }

    if (categoryId) {
      whereClause += ` AND v.categoryId = '${categoryId}'`;
    }

    if (tagId) {
      whereClause += ` AND EXISTS (SELECT 1 FROM video_tags vt WHERE vt.videoId = v.id AND vt.tagId = '${tagId}')`;
    }

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM videos v
      ${whereClause}
    `;

    // Data query
    const dataQuery = `
      SELECT
        v.id, v.title, v.description, v.status, v.visibility,
        v.filename, v.duration, v.thumbnail_url as "thumbnailUrl",
        v.file_size as "fileSize", v.views, v.metadata,
        v.user_id as "userId", v.categoryId, v.createdAt, v.updatedAt,
        u.id as "user_id", u.username, u.avatarUrl as "userAvatarUrl",
        c.id as "category_id", c.name as "category_name", c.slug as "category_slug",
        c.description as "category_description", c.iconUrl as "category_iconUrl",
        c.order as "category_order"
      FROM videos v
      LEFT JOIN users u ON u.id = v.user_id
      LEFT JOIN categories c ON c.id = v.categoryId
      ${whereClause}
      ORDER BY v.${sortBy} ${sortOrder}
      LIMIT ${limit} OFFSET ${skip}
    `;

    // Execute queries
    const totalResult = await this.videoRepository.query(countQuery);
    const total = parseInt(totalResult[0].total, 10);

    const videos = await this.videoRepository.query(dataQuery);

    // Map results to DTOs
    const items = videos.map((video: any) => {
      // Map category if exists
      let category: any = undefined;
      if (video.category_id) {
        category = {
          id: video.category_id,
          name: video.category_name,
          slug: video.category_slug,
          description: video.category_description,
          iconUrl: video.category_iconUrl,
          order: video.category_order,
          createdAt: video.category_createdAt,
          updatedAt: video.category_updatedAt,
        };
      }

      // Create response DTO
      return {
        id: video.id,
        title: video.title,
        description: video.description,
        status: video.status,
        visibility: video.visibility,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        userId: video.userId,
        username: video.username,
        userAvatarUrl: video.userAvatarUrl,
        categoryId: video.categoryId,
        category,
        tags: [], // We'll handle tags separately if needed
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
    if (video.visibility !== VideoVisibility.PUBLIC && video.userId !== currentUserId) {
      throw new ForbiddenException('You do not have permission to view this video');
    }

    // Increment view count if video is ready and not viewed by the owner
    if (video.status === VideoStatus.READY && video.userId !== currentUserId) {
      await this.videoRepository.increment({ id }, 'views', 1);
      video.views += 1;
    }

    return this.mapVideoToResponseDto(video, video.user);
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

    // Update video
    Object.assign(video, updateVideoDto);
    const updatedVideo = await this.videoRepository.save(video);

    return this.mapVideoToResponseDto(updatedVideo, video.user);
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

    // Delete video file
    try {
      const filePath = path.join(this.uploadDir, video.filename);
      await unlinkAsync(filePath);

      // Delete thumbnail if exists
      if (video.thumbnailUrl) {
        const thumbnailPath = path.join(this.thumbnailDir, path.basename(video.thumbnailUrl));
        await unlinkAsync(thumbnailPath);
      }
    } catch (error) {
      console.error('Error deleting video files:', error);
    }

    // Delete video from database
    await this.videoRepository.remove(video);
  }

  private mapVideoToResponseDto(video: Video, user: User): VideoResponseDto {
    return {
      id: video.id,
      title: video.title,
      description: video.description,
      status: video.status,
      visibility: video.visibility,
      thumbnailUrl: video.thumbnailUrl,
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
}
