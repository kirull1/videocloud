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
  Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto, CommentResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../entities/user.entity';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: { user: User },
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(createCommentDto, req.user);
  }

  @Get()
  findAll(
    @Query('videoId') videoId: string,
    @Query('parentId') parentId?: string,
  ): Promise<CommentResponseDto[]> {
    return this.commentsService.findAll(videoId, parentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CommentResponseDto> {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: { user: User },
  ): Promise<CommentResponseDto> {
    return this.commentsService.update(id, updateCommentDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @Request() req: { user: User },
  ): Promise<void> {
    return this.commentsService.remove(id, req.user.id);
  }
}