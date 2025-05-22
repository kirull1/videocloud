import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUUID()
  videoId?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}