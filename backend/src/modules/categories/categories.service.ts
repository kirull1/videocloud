import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

// PostgreSQL error interface
interface PostgresError extends Error {
  code: string;
}
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      order: {
        order: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const category = this.categoriesRepository.create(createCategoryDto);
      return await this.categoriesRepository.save(category);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as unknown as PostgresError).code === '23505'
      ) {
        // Unique constraint violation
        throw new ConflictException('Category with this name or slug already exists');
      }
      throw error;
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    try {
      Object.assign(category, updateCategoryDto);
      return await this.categoriesRepository.save(category);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as unknown as PostgresError).code === '23505'
      ) {
        // Unique constraint violation
        throw new ConflictException('Category with this name or slug already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoriesRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}
