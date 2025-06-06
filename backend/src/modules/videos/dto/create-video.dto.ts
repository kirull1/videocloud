import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
  IsArray,
  IsNumber,
} from 'class-validator';
import { VideoVisibility } from '../../../entities/video.entity';

export class CreateVideoDto {
  @IsOptional()
  @IsNumber()
  duration?: number;
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(VideoVisibility)
  visibility?: VideoVisibility;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  tagIds?: string[];
}
