import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto, CommentResponseDto } from './dto';
import { User } from '../../entities/user.entity';
import { Video } from '../../entities/video.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
  ) {}

  async create(createCommentDto: CreateCommentDto, user: User): Promise<CommentResponseDto> {
    // Check if video exists
    const video = await this.videosRepository.findOne({
      where: { id: createCommentDto.videoId },
    });

    if (!video) {
      throw new NotFoundException(`Video with ID ${createCommentDto.videoId} not found`);
    }

    // Check if parent comment exists if parentId is provided
    if (createCommentDto.parentId) {
      const parentComment = await this.commentsRepository.findOne({
        where: { id: createCommentDto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException(`Parent comment with ID ${createCommentDto.parentId} not found`);
      }

      await this.commentsRepository.update(
        { id: createCommentDto.parentId },
        { repliesCount: () => 'repliesCount + 1' },
      );
    }

    // Create new comment
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      userId: user.id,
    });

    const savedComment = await this.commentsRepository.save(comment);

    // Load user data for response
    const commentWithUser = await this.commentsRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });

    if (!commentWithUser) {
      throw new NotFoundException(`Comment with ID ${savedComment.id} not found`);
    }

    return new CommentResponseDto(commentWithUser);
  }

  async findAll(videoId: string, parentId?: string): Promise<CommentResponseDto[]> {
    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.videoId = :videoId', { videoId });

    if (parentId) {
      queryBuilder.andWhere('comment.parentId = :parentId', { parentId });
    } else {
      queryBuilder.andWhere('comment.parentId IS NULL');
    }

    queryBuilder.orderBy('comment.createdAt', 'DESC');

    const comments = await queryBuilder.getMany();
    return comments.map(comment => new CommentResponseDto(comment));
  }

  async findOne(id: string): Promise<CommentResponseDto> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return new CommentResponseDto(comment);
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<CommentResponseDto> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Check if user is the owner of the comment
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    // Update comment
    await this.commentsRepository.update({ id }, updateCommentDto);

    // Get updated comment
    const updatedComment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!updatedComment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return new CommentResponseDto(updatedComment);
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Check if user is the owner of the comment
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // If this is a reply, decrement the parent's repliesCount
    if (comment.parentId) {
      await this.commentsRepository.update(
        { id: comment.parentId },
        { repliesCount: () => 'repliesCount - 1' },
      );
    }

    await this.commentsRepository.remove(comment);
  }
}