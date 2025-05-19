import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto, UpdateTagDto, TagResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';

@Controller('tags')
@UseInterceptors(ClassSerializerInterceptor)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async findAll(): Promise<TagResponseDto[]> {
    const tags = await this.tagsService.findAll();
    return plainToInstance(TagResponseDto, tags);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TagResponseDto> {
    const tag = await this.tagsService.findOne(id);
    return plainToInstance(TagResponseDto, tag);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<TagResponseDto> {
    const tag = await this.tagsService.findBySlug(slug);
    return plainToInstance(TagResponseDto, tag);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createTagDto: CreateTagDto): Promise<TagResponseDto> {
    const tag = await this.tagsService.create(createTagDto);
    return plainToInstance(TagResponseDto, tag);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ): Promise<TagResponseDto> {
    const tag = await this.tagsService.update(id, updateTagDto);
    return plainToInstance(TagResponseDto, tag);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.tagsService.remove(id);
  }
}
