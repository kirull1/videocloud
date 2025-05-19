import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Tag } from '../../entities/tag.entity';
import { CreateTagDto, UpdateTagDto } from './dto';

// PostgreSQL error interface
interface PostgresError extends Error {
  code: string;
}

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.tagsRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({
      where: { slug },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with slug ${slug} not found`);
    }

    return tag;
  }

  async findByName(name: string): Promise<Tag | null> {
    return this.tagsRepository.findOne({
      where: { name },
    });
  }

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    try {
      const tag = this.tagsRepository.create(createTagDto);
      return await this.tagsRepository.save(tag);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as unknown as PostgresError).code === '23505'
      ) {
        // Unique constraint violation
        throw new ConflictException('Tag with this name or slug already exists');
      }
      throw error;
    }
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);

    try {
      Object.assign(tag, updateTagDto);
      return await this.tagsRepository.save(tag);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as unknown as PostgresError).code === '23505'
      ) {
        // Unique constraint violation
        throw new ConflictException('Tag with this name or slug already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.tagsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
  }

  async incrementUsageCount(id: string): Promise<Tag> {
    const tag = await this.findOne(id);
    tag.usageCount += 1;
    return this.tagsRepository.save(tag);
  }

  async decrementUsageCount(id: string): Promise<Tag> {
    const tag = await this.findOne(id);
    if (tag.usageCount > 0) {
      tag.usageCount -= 1;
    }
    return this.tagsRepository.save(tag);
  }
}
