import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReactionResponseDto } from './dto/reaction-response.dto';
import { VideoReactionsDto } from './dto/video-reactions.dto';
import { plainToInstance } from 'class-transformer';

@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Body() createReactionDto: CreateReactionDto,
  ): Promise<ReactionResponseDto> {
    const reaction = await this.reactionsService.create(req.user.id, createReactionDto);
    return plainToInstance(ReactionResponseDto, reaction, { excludeExtraneousValues: true });
  }

  @Delete(':videoId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('videoId') videoId: string): Promise<void> {
    await this.reactionsService.remove(req.user.id, videoId);
  }

  @Get('videos/:videoId')
  async findByVideoId(
    @Param('videoId') videoId: string,
    @Request() req,
  ): Promise<VideoReactionsDto> {
    const userId = req.user?.id;
    return this.reactionsService.findByVideoId(videoId, userId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async findUserReactions(@Request() req): Promise<ReactionResponseDto[]> {
    const reactions = await this.reactionsService.findUserReactions(req.user.id);
    return plainToInstance(ReactionResponseDto, reactions, { excludeExtraneousValues: true });
  }
}