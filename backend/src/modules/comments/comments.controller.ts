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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto, CommentResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../entities/user.entity';
import { Language } from '../../shared/decorators/language.decorator';
import { I18nService } from '../../shared/services/i18n/i18n.service';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly i18nService: I18nService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: { user: User },
    @Language() language: string,
  ): Promise<CommentResponseDto & { message: string }> {
    const comment = await this.commentsService.create(createCommentDto, req.user);
    return {
      ...comment,
      message: createCommentDto.parentId 
        ? this.i18nService.translate('comments', 'replyAdded', language)
        : this.i18nService.translate('comments', 'added', language)
    };
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
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: { user: User },
    @Language() language: string,
  ): Promise<CommentResponseDto & { message: string }> {
    const comment = await this.commentsService.update(id, updateCommentDto, req.user.id);
    return {
      ...comment,
      message: this.i18nService.translate('comments', 'updated', language)
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @Request() req: { user: User },
    @Language() language: string,
  ): Promise<{ message: string }> {
    await this.commentsService.remove(id, req.user.id);
    return {
      message: this.i18nService.translate('comments', 'deleted', language)
    };
  }
}