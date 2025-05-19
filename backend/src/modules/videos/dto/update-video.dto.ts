import { IsEnum, IsOptional, IsString, MaxLength, IsUUID, IsArray } from 'class-validator';
import { VideoVisibility } from '../../../entities/video.entity';

export class UpdateVideoDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

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
