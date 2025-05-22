import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Reaction, ReactionType } from '../../entities/reaction.entity';
import { Video } from '../../entities/video.entity';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { VideoReactionsDto } from './dto/video-reactions.dto';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private reactionsRepository: Repository<Reaction>,
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createReactionDto: CreateReactionDto): Promise<Reaction> {
    const { videoId, type } = createReactionDto;

    // Check if video exists
    const video = await this.videosRepository.findOne({ where: { id: videoId } });
    if (!video) {
      throw new NotFoundException(`Video with ID ${videoId} not found`);
    }

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if user already reacted to this video
      const existingReaction = await this.reactionsRepository.findOne({
        where: { userId, videoId },
      });

      if (existingReaction) {
        // If the reaction type is the same, throw conflict exception
        if (existingReaction.type === type) {
          throw new ConflictException(`User already ${type}d this video`);
        }

        // If the reaction type is different, update the existing reaction
        existingReaction.type = type;

        // Update video reaction counts
        if (type === ReactionType.LIKE) {
          video.likesCount += 1;
          video.dislikesCount -= 1;
        } else {
          video.likesCount -= 1;
          video.dislikesCount += 1;
        }

        await queryRunner.manager.save(existingReaction);
        await queryRunner.manager.save(video);
        await queryRunner.commitTransaction();

        return existingReaction;
      }

      // Create new reaction
      const reaction = this.reactionsRepository.create({
        userId,
        videoId,
        type,
      });

      // Update video reaction counts
      if (type === ReactionType.LIKE) {
        video.likesCount += 1;
      } else {
        video.dislikesCount += 1;
      }

      await queryRunner.manager.save(reaction);
      await queryRunner.manager.save(video);
      await queryRunner.commitTransaction();

      return reaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(userId: string, videoId: string): Promise<void> {
    // Check if video exists
    const video = await this.videosRepository.findOne({ where: { id: videoId } });
    if (!video) {
      throw new NotFoundException(`Video with ID ${videoId} not found`);
    }

    // Check if reaction exists
    const reaction = await this.reactionsRepository.findOne({
      where: { userId, videoId },
    });

    if (!reaction) {
      throw new NotFoundException(`Reaction not found`);
    }

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update video reaction counts
      if (reaction.type === ReactionType.LIKE) {
        video.likesCount -= 1;
      } else {
        video.dislikesCount -= 1;
      }

      await queryRunner.manager.save(video);
      await queryRunner.manager.remove(reaction);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByVideoId(videoId: string, userId?: string): Promise<VideoReactionsDto> {
    // Check if video exists
    const video = await this.videosRepository.findOne({ where: { id: videoId } });
    if (!video) {
      throw new NotFoundException(`Video with ID ${videoId} not found`);
    }

    // Get user's reaction if userId is provided
    let userReaction: string | undefined = undefined;
    if (userId) {
      const reaction = await this.reactionsRepository.findOne({
        where: { userId, videoId },
      });
      if (reaction) {
        userReaction = reaction.type;
      }
    }

    return {
      videoId,
      likesCount: video.likesCount,
      dislikesCount: video.dislikesCount,
      userReaction,
    };
  }

  async findUserReactions(userId: string): Promise<Reaction[]> {
    return this.reactionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}